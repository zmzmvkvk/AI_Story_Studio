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
  projectImageSettings, // 클라이언트의 settings.image 객체 전체
  // enhancePromptOptions는 projectImageSettings 내부에 포함됨 (enhancePrompt, enhancePromptInstructions)
}) => {
  if (!API_KEY) throw new Error("Leonardo AI API 키가 설정되지 않았습니다.");
  if (!prompt) throw new Error("이미지 생성을 위한 프롬프트가 필요합니다.");

  const {
    stylePreset,
    customModelId,
    width,
    height,
    num_images,
    guidance_scale, // API 문서에서는 guidance_scale, 스토어에서는 guidanceScale
    alchemy,
    photoReal,
    // photoRealStrength,
    promptMagic,
    // promptMagicVersion,
    // promptMagicStrength,
    negative_prompt,
    scheduler,
    sd_version,
    // seed,
    // tiling,
    enhancePrompt,
    enhancePromptInstructions,
  } = projectImageSettings || {};

  const payload = {
    prompt: prompt,
    height: parseInt(height) || 1024, // 기본값 조정 또는 필수값으로
    width: parseInt(width) || 1024, // 기본값 조정 또는 필수값으로
    num_images: parseInt(num_images) || 1,
  };

  if (guidance_scale !== undefined)
    payload.guidance_scale = parseInt(guidance_scale);
  if (negative_prompt) payload.negative_prompt = negative_prompt;
  if (scheduler) payload.scheduler = scheduler;

  // 모델 및 스타일 설정
  if (customModelId) {
    payload.modelId = customModelId;
    // 커스텀 모델 사용 시 sd_version, presetStyle 등은 자동으로 무시되거나, API에서 오류를 반환할 수 있음
  } else {
    // 커스텀 모델을 사용하지 않을 때만 sd_version과 presetStyle 적용
    if (sd_version) payload.sd_version = sd_version;
    if (stylePreset && stylePreset !== "NONE") {
      payload.presetStyle = stylePreset;
    }
  }

  // Alchemy 관련 옵션 처리 (API 문서의 최신 버전 및 구조 확인 필수!)
  // Leonardo API는 Alchemy V1, V2(LPM), PhotoReal V2 등 다양한 조합이 있을 수 있습니다.
  // 여기서는 각 옵션을 독립적으로 보내는 형태로 가정하고, API가 이를 해석한다고 가정합니다.
  // 실제로는 alchemy: { enabled: true, photoReal: true, ... } 와 같은 중첩 객체일 수 있습니다.
  if (alchemy !== undefined) payload.alchemy = alchemy; // V1 스타일. V2에서는 photoReal, promptMagic이 주 옵션일 수 있음
  if (photoReal !== undefined) payload.photoReal = photoReal;
  // if (photoRealStrength !== undefined && photoReal) payload.photoRealStrength = photoRealStrength;
  if (promptMagic !== undefined) payload.promptMagic = promptMagic;
  // if (promptMagicVersion && promptMagic) payload.promptMagicVersion = promptMagicVersion;
  // if (promptMagicStrength && promptMagic) payload.promptMagicStrength = promptMagicStrength;

  // 프롬프트 자동 개선 기능 (API 문서의 /generations 엔드포인트 파라미터 참고)
  if (enhancePrompt) {
    payload.enhancePrompt = true;
    if (enhancePromptInstructions) {
      payload.enhancePromptInstructions = enhancePromptInstructions;
    }
  }

  // 기타 옵션 (seed, tiling 등)
  // if (seed !== undefined && seed !== null && seed !== '') payload.seed = parseInt(seed);
  // if (tiling !== undefined) payload.tiling = tiling;

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

// pollGenerationResult 함수는 이전과 동일
export const pollGenerationResult = async (generationId) => {
  /* ... 이전과 동일 ... */
};

// fetchUserModels 함수는 이전과 동일
export const fetchUserModels = async () => {
  /* ... 이전과 동일 ... */
};
