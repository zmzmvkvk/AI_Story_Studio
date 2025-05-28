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

// 클라이언트 ImageSettings.jsx의 style 값과 Leonardo AI의 presetStyle 또는 modelId/styleUUID를 매핑합니다.
// 아래는 예시이며, 실제 Leonardo AI에서 제공하는 값을 사용해야 합니다.
const DEFAULT_STYLE_PRESET_MAP = {
  cartoon: "CINEMATIC", // 예시 presetStyle, 실제 API 값 확인
  realistic: "PHOTOREAL",
  pixelart: "PIXEL_ART",
  anime: "ANIME",
  cinematic: "CINEMATIC",
  "3d": "3D_RENDER",
  default: "LEONARDO", // 기본값 또는 "NONE"
};

/**
 * Leonardo AI를 사용하여 이미지 생성을 요청합니다.
 * @param {object} params
 * @param {string} params.prompt - 원본 프롬프트
 * @param {object} params.projectImageSettings - 클라이언트의 settings.image 객체
 * @param {object} [params.enhancePromptOptions] - 프롬프트 개선 옵션
 * @param {boolean} [params.enhancePromptOptions.enhancePrompt] - 프롬프트 개선 사용 여부
 * @param {string} [params.enhancePromptOptions.promptInstructions] - 프롬프트 개선 지시사항
 * @returns {Promise<string>} 생성 작업 ID (generationId)
 */
export const requestImageGeneration = async ({
  prompt,
  projectImageSettings,
  enhancePromptOptions = {},
}) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!prompt) throw new Error("이미지 생성을 위한 프롬프트가 필요합니다.");

  const {
    stylePreset,
    customModelId,
    width,
    height,
    guidanceScale,
    num_images,
    alchemy, // Leonardo Alchemy v1 사용 여부
    // photoReal, // Leonardo PhotoReal v2 옵션 (alchemy v2 또는 별도 파라미터)
    // promptMagic, // Leonardo Prompt Magic v2/v3 옵션 (alchemy v2 또는 별도 파라미터)
    negative_prompt,
  } = projectImageSettings || {};

  const payload = {
    prompt: prompt, // enhancePrompt:true 시 이 프롬프트가 Leonardo AI에 의해 내부적으로 개선됨
    height: parseInt(height) || 1344,
    width: parseInt(width) || 768,
    num_images: parseInt(num_images) || 1,
    guidance_scale: parseInt(guidanceScale) || 7,
  };

  // Alchemy 설정 (Leonardo API 버전에 따라 파라미터 구조가 다를 수 있음, 문서 확인 필수)
  // 예시: Alchemy v1을 사용하는 경우
  if (alchemy !== undefined) {
    payload.alchemy = alchemy;
    // payload.photoReal = projectImageSettings.photoReal; // Alchemy 하위 옵션일 경우
    // payload.promptMagic = projectImageSettings.promptMagic; // Alchemy 하위 옵션일 경우
    // ... 기타 Alchemy 관련 파라미터 (contrastRatio 등)
  }
  // 예시: Alchemy v2 (LPM Universal Upscaler) 또는 PhotoReal v2를 사용하는 경우
  // API 문서에 따라 photoReal: true, sd_version: "v2" 등을 payload에 직접 추가해야 할 수 있음

  // 모델 및 스타일 설정
  if (customModelId) {
    payload.modelId = customModelId;
  } else if (stylePreset && stylePreset !== "NONE" && stylePreset !== "") {
    payload.presetStyle = stylePreset; // SDXL 모델 등에서 사용
  }
  // else: modelId도 없고, presetStyle도 "NONE"이면 Leonardo 기본 모델/동작

  if (negative_prompt) {
    payload.negative_prompt = negative_prompt;
  }

  // 프롬프트 개선 옵션 (generate-enhanced-prompts 문서 참고)
  // /generations 엔드포인트에서 enhancePrompt 파라미터 사용
  if (enhancePromptOptions?.enhancePrompt) {
    payload.enhancePrompt = true; // Leonardo AI가 payload.prompt를 내부적으로 개선하도록 지시
    if (enhancePromptOptions.promptInstructions) {
      payload.enhancePromptInstructions =
        enhancePromptOptions.promptInstructions;
    }
  }

  console.log(
    "Leonardo AI 이미지 생성 요청 페이로드 (최종):",
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
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "알 수 없는 Leonardo AI 오류";
    throw new Error(`Leonardo AI 오류: ${errorMessage}`);
  }
};

export const pollGenerationResult = async (generationId) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!generationId) throw new Error("generationId가 필요합니다.");

  const pollUrl = `${LEONARDO_API_BASE_URL}/generations/${generationId}`;
  console.log(`폴링 요청: ${pollUrl}`);
  try {
    const response = await axios.get(pollUrl, { headers: HEADERS });
    const jobData = response.data?.generations_by_pk;
    if (!jobData) {
      console.error(
        "이미지 생성 결과 응답에서 generations_by_pk를 찾을 수 없습니다:",
        response.data
      );
      throw new Error(
        "이미지 생성 결과 조회에 실패했거나 응답 형식이 다릅니다."
      );
    }
    return jobData;
  } catch (error) {
    console.error(
      `Generation ID ${generationId} 결과 폴링 중 오류:`,
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "알 수 없는 Leonardo AI 폴링 오류";
    throw new Error(`Leonardo AI 폴링 오류: ${errorMessage}`);
  }
};

// 커스텀 모델 목록 가져오기 (예시, 실제 엔드포인트 확인 필요)
export const fetchUserModels = async () => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  try {
    // Leonardo AI API 문서에서 "List Platform Models" 또는 "Get user's custom models" 엔드포인트 확인
    // 예: GET /api/rest/v1/models 또는 GET /api/rest/v1/users/me/models
    const response = await axios.get(
      `${LEONARDO_API_BASE_URL}/platformModels`,
      { headers: HEADERS }
    );
    // 응답 구조에 따라 data.custom_models 또는 data.models 등으로 모델 목록 추출
    return response.data?.custom_models || response.data?.models || [];
  } catch (error) {
    console.error(
      "Leonardo AI 모델 목록 조회 중 오류:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    throw new Error("모델 목록 조회 실패");
  }
};

/*
// improvePromptAPI 함수는 /generations 엔드포인트의 enhancePrompt 옵션을 사용하므로,
// 별도로 export 하거나 사용하지 않을 수 있습니다.
// 만약 필요하다면 아래와 같이 정의하고 export 할 수 있습니다.
export const improvePromptAPI = async (originalPrompt, promptInstructions) => {
  // ... (이전 답변의 improvePromptAPI 코드 내용) ...
};
*/
