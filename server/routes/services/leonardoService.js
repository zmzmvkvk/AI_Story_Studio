import axios from "axios";

const LEONARDO_API_BASE_URL = "https://cloud.leonardo.ai/api/rest/v1"; // 실제 API 문서 확인 필요
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
  realistic: "PHOTOREAL", // 예시
  pixelart: "PIXEL_ART", // 예시
  anime: "ANIME", // 예시
  cinematic: "CINEMATIC", // 예시
  "3d": "3D_RENDER", // 예시
  default: "LEONARDO", // 기본값
};

/**
 * Leonardo AI를 사용하여 이미지 생성을 요청합니다.
 */

export const improvePromptAPI = async (originalPrompt, promptInstructions) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!originalPrompt) throw new Error("개선할 프롬프트가 필요합니다.");
  if (originalPrompt.length > 200) {
    console.warn(
      "Improve Prompt API는 200자 제한이 있습니다. 프롬프트가 잘릴 수 있습니다."
    );
    // 또는 에러를 throw 하거나, 클라이언트 단에서 글자 수 제한을 두는 것이 좋습니다.
  }

  const payload = {
    prompt: originalPrompt,
  };
  if (promptInstructions) {
    payload.promptInstructions = promptInstructions;
  }

  console.log(
    "Leonardo AI 프롬프트 개선 요청 페이로드:",
    JSON.stringify(payload, null, 2)
  );

  try {
    const response = await axios.post(
      `${LEONARDO_API_BASE_URL}/prompt/improve`,
      payload,
      { headers: HEADERS }
    );
    const enhancedPrompt = response.data?.promptGeneration?.prompt;

    if (!enhancedPrompt) {
      console.error(
        "프롬프트 개선 응답에서 개선된 프롬프트를 찾을 수 없습니다:",
        response.data
      );
      throw new Error("프롬프트 개선에 실패했거나 응답 형식이 다릅니다.");
    }
    console.log("Leonardo AI 개선된 프롬프트:", enhancedPrompt);
    console.log(
      "API 크레딧 소모:",
      response.data?.promptGeneration?.apiCreditCost
    );
    return enhancedPrompt;
  } catch (error) {
    console.error(
      "Leonardo AI 프롬프트 개선 중 오류 발생:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "알 수 없는 오류 발생";
    throw new Error(`Leonardo AI 프롬프트 개선 오류: ${errorMessage}`);
  }
};

export const requestImageGeneration = async ({
  prompt,
  style,
  leonardoOptions = {},
}) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!prompt) throw new Error("이미지 생성을 위한 프롬프트가 필요합니다.");

  // Leonardo AI API 버전에 따라 modelId, presetStyle, sd_version 등의 파라미터가 다를 수 있습니다.
  // 최신 API 문서를 반드시 확인하세요. 여기서는 presetStyle을 사용하는 예시를 들겠습니다.
  const presetStyle =
    leonardoOptions.presetStyle ||
    DEFAULT_STYLE_PRESET_MAP[style?.toLowerCase()] ||
    DEFAULT_STYLE_PRESET_MAP["default"];

  const payload = {
    prompt: prompt,
    presetStyle: presetStyle, // 또는 modelId, styleUUID 등 API 버전에 맞는 파라미터
    height: parseInt(leonardoOptions.height) || 1024,
    width: parseInt(leonardoOptions.width) || 768,
    num_images: parseInt(leonardoOptions.num_images) || 1,
    // alchemy: leonardoOptions.alchemy !== undefined ? leonardoOptions.alchemy : true, // Alchemy v1
    // photoReal: leonardoOptions.photoReal !==undefined ? leonardoOptions.photoReal : false, // PhotoReal v2
    // sd_version: "v2" // PhotoReal v2 사용 시
    // negative_prompt, guidance_scale 등 기타 옵션 추가 가능
    ...(leonardoOptions.negative_prompt && {
      negative_prompt: leonardoOptions.negative_prompt,
    }),
  };

  console.log(
    "Leonardo AI 이미지 생성 요청 페이로드:",
    JSON.stringify(payload, null, 2)
  );

  try {
    // generations-lcm 엔드포인트는 더 빠른 생성을 제공할 수 있습니다 (API 문서 확인)
    const response = await axios.post(
      `${LEONARDO_API_BASE_URL}/generations`,
      payload,
      { headers: HEADERS }
    );
    const generationId = response.data?.sdGenerationJob?.generationId; // v1 API 응답 구조

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
      "알 수 없는 오류 발생";
    throw new Error(`Leonardo AI 오류: ${errorMessage}`);
  }
};

/**
 * 지정된 generationId의 이미지 생성 상태를 확인하고 결과를 반환합니다.
 */
export const pollGenerationResult = async (generationId) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!generationId) throw new Error("generationId가 필요합니다.");

  const pollUrl = `${LEONARDO_API_BASE_URL}/generations/${generationId}`;
  console.log(`폴링 요청: ${pollUrl}`);

  try {
    const response = await axios.get(pollUrl, { headers: HEADERS });
    const jobData = response.data?.generations_by_pk; // v1 API 응답 구조

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
      "알 수 없는 오류 발생";
    throw new Error(`Leonardo AI 폴링 오류: ${errorMessage}`);
  }
};

// TODO: 모션 생성 관련 함수들 (generateMotion, pollMotionResult)
