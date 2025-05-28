import express from "express";
import { generateStoryWithGPT } from "./services/gptService.js";

import {
  improvePromptAPI,
  requestImageGeneration,
  pollGenerationResult,
} from "./services/leonardoService.js"; // improvePromptAPI 추가

// Firestore 직접 접근이 필요하다면 firebase-admin 설정 및 import 필요
// import { db } from '../firebaseAdmin.js'; // 예시

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
    // storyPrompt나 productImageUrl이 둘 다 없는 경우는 gptService에서 처리

    const generatedStory = await generateStoryWithGPT({
      storyPrompt,
      productImageUrl,
      projectSettings,
    });
    res.status(200).json({ story: generatedStory });
  } catch (error) {
    next(error); // 전역 에러 핸들러로 전달
  }
});

router.post("/improve-prompt", async (req, res, next) => {
  try {
    const { prompt, instructions } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "개선할 'prompt'가 필요합니다." });
    }

    const improvedPrompt = await improvePromptAPI(prompt, instructions);
    res.status(200).json({ improvedPrompt: improvedPrompt });
  } catch (error) {
    next(error);
  }
});

// --- Leonardo AI 이미지 생성 라우트 ---
router.post("/generate-image", async (req, res, next) => {
  try {
    const {
      prompt, // 클라이언트에서 제공 (예: Story.jsx에서 생성된 컷의 텍스트)
      style, // 클라이언트 설정에서 가져온 스타일 문자열 (예: "cartoon")
      leonardoOptions = {}, // API에 직접 전달할 추가 옵션 (width, height, negative_prompt 등)
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "요청에 'prompt'가 필요합니다." });
    }

    const DEFAULT_MAX_ATTEMPTS = parseInt(leonardoOptions.maxAttempts) || 10;
    const DEFAULT_POLLING_DELAY =
      parseInt(leonardoOptions.pollingDelay) || 5000; // 5초

    const generationId = await requestImageGeneration({
      prompt,
      style,
      leonardoOptions,
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
    next(error); // 전역 에러 핸들러로 전달
  }
});

// --- 테스트 라우트 ---
router.get("/test", (req, res) => {
  res.json({ message: "API 라우트 테스트 성공!" });
});

export default router;
