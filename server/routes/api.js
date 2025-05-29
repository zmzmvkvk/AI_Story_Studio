// server/routes/api.js
import express from "express";
// generateImagePromptWithGPT 함수를 gptService에서 import 합니다.
import {
  generateStoryWithGPT,
  generateImagePromptWithGPT,
} from "./services/gptService.js";
import {
  requestImageGeneration,
  pollGenerationResult,
  fetchUserModels,
} from "./services/leonardoService.js";

const router = express.Router();

// --- AI 스토리 생성 라우트 ---
// (이전과 동일하게 유지)
router.post("/generate-ai-story", async (req, res, next) => {
  try {
    const { storyPrompt, productImageUrl, projectSettings } = req.body;
    if (!projectSettings) {
      return res
        .status(400)
        .json({ error: "프로젝트 설정(projectSettings) 정보가 필요합니다." });
    }
    const generatedStory = await generateStoryWithGPT({
      storyPrompt,
      productImageUrl,
      projectSettings,
    });
    res.status(200).json({ story: generatedStory });
  } catch (error) {
    next(error);
  }
});

// --- Leonardo AI 이미지 생성 라우트 ---
router.post("/generate-image", async (req, res, next) => {
  try {
    // req.body.prompt는 클라이언트에서 보낸 원본 한국어 컷 내용입니다.
    const { prompt: originalKoreanCutText, projectImageSettings } = req.body;

    console.log(
      "백엔드 수신 projectImageSettings:",
      JSON.stringify(projectImageSettings, null, 2)
    );

    if (!originalKoreanCutText) {
      return res
        .status(400)
        .json({ error: "요청에 'prompt'(원본 컷 내용)가 필요합니다." });
    }
    if (!projectImageSettings) {
      return res
        .status(400)
        .json({ error: "요청에 'projectImageSettings'가 필요합니다." });
    }

    // --- 1. GPT를 사용하여 상세 영어 프롬프트 생성 ---
    let detailedEnglishPrompt;
    try {
      console.log(
        `GPT에 상세 영어 프롬프트 생성 요청: "${originalKoreanCutText}"`
      );
      detailedEnglishPrompt = await generateImagePromptWithGPT({
        originalCutText: originalKoreanCutText,
        // projectSettings: projectSettings, // 필요시 전체 프로젝트 설정을 전달하여 톤앤매너 일관성 유지 가능
      });

      if (!detailedEnglishPrompt || detailedEnglishPrompt.trim() === "") {
        // GPT가 유효한 프롬프트를 반환하지 않은 경우에 대한 처리
        console.warn(
          "GPT가 유효한 영어 프롬프트를 생성하지 못했습니다. 이 경우 에러를 반환합니다."
        );
        throw new Error(
          "GPT가 유효한 영어 이미지 프롬프트를 생성하지 못했습니다."
        );
      }
      console.log(
        "GPT가 생성한 최종 영어 프롬프트 (Leonardo AI 전달용):",
        detailedEnglishPrompt
      );
    } catch (gptError) {
      console.error(
        "GPT 상세 이미지 프롬프트 생성 과정에서 오류 발생:",
        gptError
      );
      // 클라이언트에게 GPT 오류를 알립니다.
      return res.status(500).json({
        error: "GPT를 이용한 이미지 프롬프트 생성에 실패했습니다.",
        details: gptError.message,
      });
    }
    // --- GPT 상세 프롬프트 생성 완료 ---

    const DEFAULT_MAX_ATTEMPTS =
      parseInt(projectImageSettings.maxAttempts) || 10;
    const DEFAULT_POLLING_DELAY =
      parseInt(projectImageSettings.pollingDelay) || 5000;

    // Leonardo AI에는 GPT가 생성한 영어 프롬프트를 전달합니다.
    const generationId = await requestImageGeneration({
      prompt: detailedEnglishPrompt, // GPT가 생성한 영어 프롬프트 사용
      projectImageSettings,
      // enhancePromptOptions는 projectImageSettings 내부에 포함되어 leonardoService에서 처리됩니다.
    });

    // ... (이하 이미지 생성 결과 폴링 및 응답 로직은 이전과 동일)
    let attempts = 0;
    let finalImageUrl = null;
    let allGeneratedImages = [];
    let lastJobState = null;

    while (attempts < DEFAULT_MAX_ATTEMPTS) {
      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_POLLING_DELAY)
      );
      const jobData = await pollGenerationResult(generationId);
      lastJobState = jobData;

      if (
        jobData?.status === "COMPLETE" &&
        jobData?.generated_images?.length > 0
      ) {
        finalImageUrl = jobData.generated_images[0].url;
        allGeneratedImages = jobData.generated_images;
        break;
      } else if (jobData?.status === "FAILED") {
        console.error(`이미지 생성 작업 실패 (ID: ${generationId}):`, jobData);
        throw new Error(
          `이미지 생성 작업 실패: ${jobData.failureReason || "알 수 없는 이유"}`
        );
      }
      attempts++;
    }

    if (finalImageUrl) {
      res.status(200).json({
        message: "이미지 생성 성공! (프롬프트 by GPT)", // 메시지에 출처 명시
        imageUrl: finalImageUrl,
        allGeneratedImages: allGeneratedImages,
        generationId: generationId,
        jobDetails: lastJobState,
      });
    } else {
      console.error(
        `이미지 생성 타임아웃 또는 실패 (ID: ${generationId}). 최종 상태:`,
        lastJobState
      );
      res.status(500).json({
        error: "이미지 생성 완료에 실패했거나 URL을 찾을 수 없습니다.",
        details: `최종 상태: ${
          lastJobState?.status || "알 수 없음"
        }. 최대 시도 횟수(${DEFAULT_MAX_ATTEMPTS}) 도달.`,
        generationId: generationId,
        lastKnownJobState: lastJobState,
      });
    }
  } catch (error) {
    // GPT 또는 Leonardo 서비스 호출 중 발생한 모든 에러를 처리합니다.
    next(error);
  }
});

// --- Leonardo AI 커스텀 모델 목록 가져오기 라우트 (선택 사항) ---
// (이전과 동일하게 유지)
router.get("/user-models", async (req, res, next) => {
  try {
    const models = await fetchUserModels();
    res.status(200).json({ models });
  } catch (error) {
    next(error);
  }
});

// --- 테스트 라우트 ---
// (이전과 동일하게 유지)
router.get("/test", (req, res) => {
  res.json({ message: "API 라우트 테스트 성공!" });
});

export default router;
