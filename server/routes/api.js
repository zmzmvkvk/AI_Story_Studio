// server/routes/api.js
import express from "express";
import { generateStoryWithGPT } from "./services/gptService.js";
import {
  requestImageGeneration,
  pollGenerationResult,
  fetchUserModels,
} from "./services/leonardoService.js";

const router = express.Router();

// --- AI 스토리 생성 라우트 ---
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
    const {
      prompt,
      projectImageSettings, // 클라이언트의 settings.image 객체 전체
      enhancePromptOptions = {}, // { enhancePrompt: boolean, promptInstructions: string }
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "요청에 'prompt'가 필요합니다." });
    }
    if (!projectImageSettings) {
      return res
        .status(400)
        .json({ error: "요청에 'projectImageSettings'가 필요합니다." });
    }

    const DEFAULT_MAX_ATTEMPTS =
      parseInt(projectImageSettings.maxAttempts) || 10; // 필요시 클라이언트에서 전달
    const DEFAULT_POLLING_DELAY =
      parseInt(projectImageSettings.pollingDelay) || 5000;

    const generationId = await requestImageGeneration({
      prompt,
      projectImageSettings,
      enhancePromptOptions, // 이 옵션을 서비스 함수로 전달
    });

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
        message: "이미지 생성 성공!",
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
    next(error);
  }
});

// --- Leonardo AI 커스텀 모델 목록 가져오기 라우트 (선택 사항) ---
router.get("/user-models", async (req, res, next) => {
  try {
    const models = await fetchUserModels();
    res.status(200).json({ models });
  } catch (error) {
    next(error);
  }
});

// --- 테스트 라우트 ---
router.get("/test", (req, res) => {
  res.json({ message: "API 라우트 테스트 성공!" });
});

export default router;
