// server/services/gptService.js
import OpenAI from "openai"; // 또는 이전 버전의 'openai' 패키지
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT를 사용하여 스토리를 생성합니다.
 * @param {object} params
 * @param {string} params.storyPrompt - 사용자가 입력한 스토리 프롬프트
 * @param {string} [params.productImageUrl] - 참고할 상품 이미지 URL (프롬프트에 설명으로 포함 가능)
 * @param {object} params.projectSettings - 프로젝트 설정 (콘텐츠 플랫폼, 유형, 언어, 캐릭터 등)
 * @returns {Promise<string>} 생성된 스토리 텍스트
 */
export const generateStoryWithGPT = async ({
  storyPrompt,
  productImageUrl,
  projectSettings,
}) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }
  if (!storyPrompt && !productImageUrl) {
    // 둘 다 없으면 에러보다는 기본 프롬프트로 유도하거나, 경고 후 진행
    console.warn(
      "스토리 프롬프트나 상품 이미지가 제공되지 않았습니다. 일반적인 스토리 생성을 시도합니다."
    );
  }

  const { contents, story } = projectSettings; // Setting.jsx에서 가져온 설정값

  // GPT에 전달할 시스템 메시지 및 사용자 메시지 구성 (프롬프트 엔지니어링)
  let systemMessageContent = `당신은 창의적인 스토리 작가 AI입니다. 사용자의 요청과 프로젝트 설정을 바탕으로 흥미로운 비디오 스토리를 컷(Scene 또는 컷) 단위로 작성해주세요. 각 컷은 명확하게 구분되어야 합니다. (예: "컷 1: 내용", "Scene 2: 내용").`;
  if (story?.language === "ko") {
    systemMessageContent += ` 모든 응답은 한국어로 작성해주세요.`;
  } else if (story?.language === "en") {
    systemMessageContent += ` All responses should be in English.`;
  } // 다른 언어 지원 추가 가능

  let userMessageContent = `다음 정보를 바탕으로 ${
    contents?.platform || "플랫폼"
  }용 ${contents?.type || "영상"} 스토리를 컷 단위로 작성해주세요:\n`;
  if (storyPrompt) {
    userMessageContent += `- 사용자 스토리 프롬프트: "${storyPrompt}"\n`;
  }
  if (productImageUrl) {
    userMessageContent += `- 참고 상품 이미지: 이 이미지는 [${productImageUrl}]에서 확인할 수 있는 상품을 중심으로 스토리를 구상해주세요. (AI는 이미지를 직접 볼 수 없으므로, 이미지에 대한 설명을 프롬프트에 추가하는 것이 좋습니다.)\n`;
  }
  if (story?.mainCharacter) {
    userMessageContent += `- 메인 캐릭터: ${story.mainCharacter}\n`;
  }
  userMessageContent += `- 콘텐츠 플랫폼: ${
    contents?.platform || "지정되지 않음"
  }\n`;
  userMessageContent += `- 콘텐츠 유형: ${contents?.type || "지정되지 않음"}\n`;
  userMessageContent += `- 원하는 스토리의 분위기나 주요 메시지가 있다면 구체적으로 작성해주세요. (이 부분은 클라이언트에서 추가 입력을 받거나, 설정에서 가져올 수 있습니다.)\n`;
  userMessageContent += `\n각 컷은 "컷 번호: [내용]" 또는 "Scene 번호: [내용]" 형식으로 명확히 구분해주세요. 약 3-5개의 컷으로 구성된 짧은 스토리를 만들어주세요.`;

  console.log("GPT 요청 시스템 메시지:", systemMessageContent);
  console.log("GPT 요청 사용자 메시지:", userMessageContent);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 또는 "gpt-4" 등 필요에 따라 모델 변경
      messages: [
        { role: "system", content: systemMessageContent },
        { role: "user", content: userMessageContent },
      ],
      // temperature, max_tokens 등 추가 파라미터 설정 가능
    });

    const generatedStoryText = completion.choices[0]?.message?.content?.trim();
    if (!generatedStoryText) {
      throw new Error("GPT로부터 유효한 스토리 텍스트를 받지 못했습니다.");
    }
    console.log("GPT 생성 스토리:", generatedStoryText);
    return generatedStoryText;
  } catch (error) {
    console.error(
      "GPT 스토리 생성 중 오류 발생:",
      error.response ? error.response.data : error.message
    );
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "알 수 없는 GPT API 오류";
    throw new Error(`GPT API 오류: ${errorMessage}`);
  }
};
