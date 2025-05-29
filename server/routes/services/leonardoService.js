// server/services/leonardoService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const LEONARDO_API_BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";
const API_KEY = process.env.LEONARDO_API_KEY;

if (!API_KEY) {
  console.error(
    "LEONARDO_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요."
  );
}

const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: `Bearer ${API_KEY}`,
};

export const requestImageGeneration = async ({
  prompt,
  projectImageSettings, // 클라이언트의 settings.image 객체 전체 (enhancePrompt 필드 등 포함)
}) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!prompt) throw new Error("이미지 생성을 위한 프롬프트가 필요합니다.");

  const {
    stylePreset,
    customModelId,
    width,
    height,
    num_images,
    guidanceScale, // 스토어에서는 guidanceScale, API에서는 guidance_scale
    alchemy,
    photoReal,
    promptMagic,
    negative_prompt,
    scheduler,
    sd_version,
    enhancePrompt,
    enhancePromptInstructions,
  } = projectImageSettings || {};

  const payload = {
    prompt: prompt,
    height: parseInt(height) || 1024,
    width: parseInt(width) || 1024,
    num_images: parseInt(num_images) || 1,
  };

  // Map frontend 'guidanceScale' to API 'guidance_scale'
  if (guidanceScale !== undefined) {
    payload.guidance_scale = parseInt(guidanceScale);
  }
  if (negative_prompt) payload.negative_prompt = negative_prompt;
  if (scheduler) payload.scheduler = scheduler;

  if (customModelId) {
    payload.modelId = customModelId;
  } else {
    if (sd_version) payload.sd_version = sd_version;
    if (stylePreset && stylePreset !== "NONE") {
      payload.presetStyle = stylePreset;
    }
  }

  if (alchemy !== undefined) payload.alchemy = alchemy;
  if (photoReal !== undefined) payload.photoReal = photoReal;
  if (promptMagic !== undefined) payload.promptMagic = promptMagic;

  if (enhancePrompt) {
    payload.enhancePrompt = true;
    if (enhancePromptInstructions) {
      payload.enhancePromptInstructions = enhancePromptInstructions;
    }
  }

  console.log(
    "Leonardo AI 이미지 생성 요청 페이로드 (상세화):",
    JSON.stringify(payload, null, 2)
  );

  try {
    const response = await axios.post(
      `${LEONARDO_API_BASE_URL}/generations`,
      payload,
      { headers: HEADERS }
    );
    const generationId = response.data?.sdGenerationJob?.generationId;

    if (!generationId) {
      console.error(
        "이미지 생성 요청 응답에서 generationId를 찾을 수 없습니다:",
        response.data
      );
      throw new Error(
        "이미지 생성 요청에 실패했거나 generationId를 받지 못했습니다."
      );
    }
    console.log("Leonardo AI 이미지 생성 작업 ID:", generationId);
    return generationId;
  } catch (error) {
    console.error(
      "Leonardo AI 이미지 생성 요청 중 오류 발생:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    const errorDetail =
      error.response?.data?.error ||
      error.response?.data?.details ||
      error.response?.data;
    const errorMessage =
      typeof errorDetail === "string"
        ? errorDetail
        : errorDetail?.message ||
          error.message ||
          "알 수 없는 Leonardo AI 오류";
    throw new Error(`Leonardo AI 오류: ${errorMessage}`);
  }
};

export const pollGenerationResult = async (generationId) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!generationId) throw new Error("generationId가 필요합니다.");

  try {
    const response = await axios.get(
      `${LEONARDO_API_BASE_URL}/generations/${generationId}`,
      { headers: HEADERS }
    );
    // generations_by_pk 가 실제 응답 객체 이름일 수 있음 (API 문서 확인 필요)
    return response.data?.generations_by_pk || response.data;
  } catch (error) {
    console.error(
      `generationId ${generationId} 상태 폴링 중 오류:`,
      error.response ? error.response.data : error.message
    );
    // 폴링 실패는 이미지 생성 실패로 간주하지 않고, null 이나 에러 상태를 포함한 객체 반환 가능
    return { status: "POLLING_ERROR", error: error.message, generationId };
  }
};

export const fetchUserModels = async () => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  try {
    const response = await axios.get(
      `${LEONARDO_API_BASE_URL}/models?type=USER`, // 예시: 사용자 모델만 가져오기, API 문서 확인 필요
      { headers: HEADERS }
    );
    // API 응답 구조에 따라 `response.data.custom_models` 또는 다른 경로일 수 있음
    return response.data?.custom_models || response.data?.models || [];
  } catch (error) {
    console.error(
      "Leonardo AI 커스텀 모델 목록 가져오기 오류:",
      error.response ? error.response.data : error.message
    );
    throw new Error("커스텀 모델 로드 실패");
  }
};
