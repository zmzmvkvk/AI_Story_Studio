// server/routes/api.js
import express from "express";
import {
  requestImageGeneration,
  pollGenerationResult,
} from "../services/leonardoService.js";
import { generateStoryWithGPT } from "../services/gptService.js"; // 새로 추가

// Firestore 관련 import는 여기서는 직접 사용하지 않고, 클라이언트 요청 시 필요한 storyId 등을 받아서 처리합니다.
// 만약 서버 사이드에서 직접 Firestore를 접근해야 한다면, firebase-admin 설정을 server.js 또는 별도 모듈에서 하고 여기서 사용합니다.
// 지금 구조에서는 클라이언트가 storyId와 cutId를 제공하고, 서버는 해당 cut의 텍스트를 프롬프트로 사용한다고 가정합니다.
// 하지만 제공해주신 imageGeneration.js에서는 서버가 직접 Firestore에서 cut 정보를 가져오고 있습니다. 이 로직을 유지하거나 변경할 수 있습니다.
// 여기서는 클라이언트에서 프롬프트를 직접 받는 형태로 단순화하고, 필요시 Firestore 접근 로직을 추가하는 방향으로 안내합니다.

const router = express.Router();

// --- AI 스토리 생성 라우트 ---
router.post("/generate-ai-story", async (req, res) => {
  const {
    storyPrompt, // 사용자가 입력한 프롬프트
    productImageUrl, // 참고 이미지 URL (선택)
    projectSettings, // 클라이언트 useSettingStore에서 가져온 전체 설정 객체
    // projectSettings.contents, projectSettings.story 등을 포함해야 함
  } = req.body;

  if (!projectSettings) {
    return res
      .status(400)
      .json({ error: "프로젝트 설정(projectSettings) 정보가 필요합니다." });
  }
  if (!storyPrompt && !productImageUrl) {
    // 둘 다 없는 경우 gptService에서 처리하므로 여기서는 일단 통과시키거나,
    // 더 엄격하게 하고 싶다면 여기서 에러 처리 가능
    // return res.status(400).json({ error: "스토리 프롬프트 또는 상품 이미지 URL 중 하나는 필요합니다." });
  }

  try {
    const generatedStory = await generateStoryWithGPT({
      storyPrompt,
      productImageUrl,
      projectSettings,
    });
    res.status(200).json({ story: generatedStory });
  } catch (error) {
    console.error("AI 스토리 생성 라우트 오류:", error);
    res.status(500).json({
      error: "AI 스토리 생성 중 서버 오류 발생",
      details: error.message,
    });
  }
});

// --- 이미지 생성 관련 라우트 ---
router.post("/generate-image", async (req, res) => {
  // 클라이언트 Image.jsx의 handleGenerateImageForCut에서 cutId와 cut.text를 보낼 것으로 예상
  // const { cutId, prompt, style, leonardoOptions } = req.body;
  // --- 제공해주신 imageGeneration.js의 필드를 기준으로 수정 ---
  const {
    storyId, // 스토리를 특정하기 위한 ID (Firestore 문서 ID)
    cutId, // 컷(장면)을 특정하기 위한 ID (cutscenes 배열 내 객체의 고유 ID)
    // character, // 캐릭터 정보는 프롬프트에 포함되거나, 별도 처리 로직 필요
    style, // 클라이언트 ImageSettings에서 설정한 스타일 문자열 (예: "cartoon")
    leonardoOptions = {}, // API에 직접 전달할 추가 옵션
  } = req.body;

  // 필수 파라미터 검증 (프론트엔드 구조에 맞춰 조정)
  // 프론트엔드 Image.jsx의 handleGenerateImageForCut은 cut.text를 프롬프트로 사용할 수 있습니다.
  // 따라서, 서버는 storyId, cutId를 받아 Firestore에서 해당 cut의 text를 가져오거나,
  // 클라이언트에서 직접 prompt를 받도록 할 수 있습니다.
  // 여기서는 클라이언트에서 prompt를 직접 받는다고 가정하고,
  // 만약 Firestore에서 가져와야 한다면 해당 로직을 여기에 추가해야 합니다.
  let promptText = leonardoOptions.prompt; // 클라이언트가 직접 프롬프트를 보낸다고 가정

  if (!promptText && (!storyId || !cutId)) {
    return res.status(400).json({
      error:
        "요청에 'prompt'가 필요하거나, 'storyId'와 'cutId'가 모두 필요합니다.",
    });
  }

  // 만약 storyId와 cutId로 Firestore에서 프롬프트를 가져와야 한다면, 여기에 해당 로직 추가
  // 예시:
  // if (!promptText && storyId && cutId) {
  //   try {
  //     const storyDoc = await db.collection('stories').doc(storyId).get();
  //     if (!storyDoc.exists) return res.status(404).json({ error: '스토리를 찾을 수 없습니다.' });
  //     const cut = storyDoc.data().cutscenes?.find(c => c.id === cutId); // cut.id가 고유하다고 가정
  //     if (!cut || !cut.text) return res.status(404).json({ error: '컷 또는 컷 텍스트를 찾을 수 없습니다.'});
  //     promptText = cut.text; // 또는 cut.image_prompt 필드가 있다면 그것을 사용
  //   } catch (dbError) {
  //     console.error('Firestore 조회 오류:', dbError);
  //     return res.status(500).json({ error: '스토리 데이터 조회 중 오류 발생', details: dbError.message });
  //   }
  // }

  const DEFAULT_MAX_ATTEMPTS = leonardoOptions.maxAttempts || 10; // 기존 코드 참고
  const DEFAULT_POLLING_DELAY = leonardoOptions.pollingDelay || 5000; // 기존 코드 참고

  try {
    const generationId = await requestImageGeneration({
      prompt: promptText, // Firestore에서 가져왔거나 클라이언트에서 받은 프롬프트
      style, // 예: "cartoon", "photorealistic" 등
      leonardoOptions, // modelId, width, height 등 API 직접 전달 옵션
    });

    let attempts = 0;
    let finalImageUrl = null;
    let lastJobState = null;

    while (attempts < DEFAULT_MAX_ATTEMPTS) {
      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_POLLING_DELAY)
      );
      const jobData = await pollGenerationResult(generationId);
      lastJobState = jobData; // 마지막 상태 저장

      if (
        jobData.status === "COMPLETE" &&
        jobData.generated_images?.length > 0
      ) {
        finalImageUrl = jobData.generated_images[0].url;
        // 필요하다면 다른 이미지 URL들도 처리 (jobData.generated_images 배열)
        break; // 성공
      } else if (jobData.status === "FAILED") {
        console.error(`이미지 생성 작업 실패 (ID: ${generationId}):`, jobData);
        throw new Error(
          `이미지 생성 작업 실패: ${jobData.failureReason || "알 수 없는 이유"}`
        );
      }
      // PENDING 또는 다른 중간 상태면 계속 폴링
      attempts++;
    }

    if (finalImageUrl) {
      // 성공 응답: 클라이언트는 이 URL을 사용하여 이미지를 표시하고,
      // useStoryStore.saveStoryData 등을 통해 Firestore에 저장할 수 있습니다.
      // 제공해주신 코드에서는 서버가 직접 Firestore에 업데이트 했지만,
      // 클라이언트에서 최종 데이터를 받아 업데이트하는 것이 상태 관리 측면에서 더 일반적일 수 있습니다.
      // 여기서는 생성된 이미지 URL과 generationId를 클라이언트에 반환합니다.
      res.status(200).json({
        message: "이미지 생성 성공!",
        imageUrl: finalImageUrl, // 첫 번째 이미지 URL
        allGeneratedImages: lastJobState?.generated_images, // 모든 생성된 이미지 정보 (필요시)
        generationId: generationId,
        jobDetails: lastJobState, // 디버깅 또는 추가 정보용
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
    console.error("이미지 생성 라우트 오류:", error);
    res.status(500).json({
      error: "이미지 생성 중 서버 오류 발생",
      details: error.message,
    });
  }
});

// --- 테스트 라우트 (기존) ---
router.get("/test", (req, res) => {
  res.json({ message: "API 라우트 테스트 성공!" });
});

export default router;
