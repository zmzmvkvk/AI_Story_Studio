// server/services/leonardoService.js
import axios from "axios";

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

const DEFAULT_MODEL_ID = "b2614463-296c-462a-9586-aafdb8f00e36"; // 예: Leonardo Diffusion XL
const DEFAULT_STYLE_UUID_MAP = {
  // 클라이언트 ImageSettings의 style 값과 매핑
  cartoon: "b2a54a51-230b-4d4f-ad4e-8409bf58645f", // 3D Animation Style (예시, 실제 UUID 확인 필요)
  photorealistic: "5bdc3f2a-1be6-4d1c-8e77-992a30824a2c", // Photoreal (예시)
  anime: "e316b1a8-a186-43bf-8590-c4e2d916c677", // Anime (예시)
  cinematic: "2060c851-327d-4eff-bff2-80098e649610", // Cinematic (예시)
  // 추가적인 스타일들을 여기에 매핑합니다. 클라이언트의 Image.jsx와 ImageSettings.jsx를 참고하세요.
  //
  default: "556c1ee5-ec38-42e8-955a-1e82dad0ffa1", // Leonardo Creative (예시)
};

/**
 * Leonardo AI를 사용하여 이미지 생성을 요청합니다.
 * @param {object} params - 이미지 생성 파라미터
 * @param {string} params.prompt - 이미지 프롬프트
 * @param {string} [params.style] - 클라이언트에서 선택한 스타일 (예: "cartoon", "photorealistic")
 * @param {object} [params.leonardoOptions] - API에 직접 전달할 옵션 (modelId, width, height 등)
 * @returns {Promise<string>} 생성 작업 ID (generationId)
 */
export const requestImageGeneration = async ({
  prompt,
  style,
  leonardoOptions = {},
}) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!prompt) throw new Error("이미지 생성을 위한 프롬프트가 필요합니다.");

  const modelId = leonardoOptions.modelId || DEFAULT_MODEL_ID;
  const styleUUID =
    leonardoOptions.styleUUID ||
    DEFAULT_STYLE_UUID_MAP[style?.toLowerCase()] ||
    DEFAULT_STYLE_UUID_MAP["default"];

  const payload = {
    prompt: prompt, // 여기에 추가적인 프롬프트 엔지니어링 (예: 캐릭터 정보 결합) 가능
    modelId: modelId,
    width: leonardoOptions.width || 720, // 클라이언트 Image.jsx의 기본값과 유사하게 설정 가능
    height: leonardoOptions.height || 1280, // 클라이언트 Image.jsx의 기본값과 유사하게 설정 가능
    num_images: leonardoOptions.num_images || 1,
    alchemy:
      leonardoOptions.alchemy !== undefined ? leonardoOptions.alchemy : true, // Leonardo Alchemy 사용 여부
    // photoReal: leonardoOptions.photoReal, // Leonardo PhotoReal 사용 여부 (v2)
    // presetStyle: styleUUID, // v2 API에서는 styleUUID 대신 presetStyle을 사용할 수 있음 (API 문서 확인)
    // 기타 옵션들: negative_prompt, guidance_scale, controlNet 등
    ...(styleUUID && { style: styleUUID }), // Leonardo v1 API 스타일 적용 (예시, API 버전에 따라 다를 수 있음)
    // 참고: 제공해주신 코드에서는 styleUUID를 payload.styleUUID로 사용하고 있습니다.
    // Leonardo AI API 버전에 따라 'style', 'presetStyle', 'sd_version' 등의 파라미터가 다를 수 있으니
    // 최신 API 문서를 반드시 확인해야 합니다.
  };
  if (leonardoOptions.negative_prompt) {
    payload.negative_prompt = leonardoOptions.negative_prompt;
  }

  console.log(
    "Leonardo AI 이미지 생성 요청 페이로드:",
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
      error.response?.data?.error || error.message || "알 수 없는 오류 발생";
    throw new Error(`Leonardo AI 오류: ${errorMessage}`);
  }
};

/**
 * 지정된 generationId의 이미지 생성 상태를 확인하고 결과를 반환합니다.
 * @param {string} generationId - 확인할 생성 작업 ID
 * @returns {Promise<object>} 생성된 이미지 정보 (status, url 등)
 */
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
    return jobData; // { status, generated_images: [{ url, ... }], ... }
  } catch (error) {
    console.error(
      `Generation ID ${generationId} 결과 폴링 중 오류:`,
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    const errorMessage =
      error.response?.data?.error || error.message || "알 수 없는 오류 발생";
    throw new Error(`Leonardo AI 폴링 오류: ${errorMessage}`);
  }
};

// TODO: 모션 생성 관련 함수들 (generateMotion, pollMotionResult)
