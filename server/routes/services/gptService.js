// server/services/gptService.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT를 사용하여 스토리를 생성합니다.
 * @param {object} params
 * @param {string} params.storyPrompt - 사용자가 입력한 스토리 프롬프트
 * @param {string} [params.productImageUrl] - 참고할 상품 이미지 URL
 * @param {object} params.projectSettings - 프로젝트 설정 (contents, story 등)
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

  const contentsSettings = projectSettings?.contents || {};
  const storySettings = projectSettings?.story || {}; //

  // --- 프롬프트 엔지니어링: 역할 부여 및 강력한 지시 ---

  let targetLanguage = "영어";
  let languageInstructions =
    "The entire story, including scene descriptions, dialogues, and actions, must be written exclusively in English.";
  if (storySettings?.language === "ko") {
    targetLanguage = "한국어";
    languageInstructions =
      "이야기 전체 (장면 묘사, 대사, 행동 지문 포함)는 반드시 한국어로만 작성되어야 합니다. 다른 언어가 조금이라도 섞이면 안 됩니다.";
  }

  const systemMessageContent = `당신은 ${targetLanguage}로 창작 활동을 하는 뛰어난 스토리 작가입니다. 당신의 임무는 사용자의 요청과 주어진 설정을 충실히 반영하여, 비디오 제작에 적합하도록 여러 개의 장면(컷 또는 Scene)으로 구성된 흥미로운 스토리를 만드는 것입니다. 각 장면은 명확하게 "컷 #번호:" 형식으로 시작해야 하며, 다른 추가적인 장면 제목(예: Scene #X: Title)은 포함하지 마십시오. 오직 "컷 #번호:" 형식만 사용해야 합니다. ${languageInstructions}`;

  let userMessageContent = `
다음 요구사항을 바탕으로 ${contentsSettings?.platform || "지정된 플랫폼"}용 ${
    contentsSettings?.type || "지정된 유형의 영상"
  } 스토리를 약 3~5개의 컷으로 구성하여 작성해주세요.
각 컷은 "컷 #1:", "컷 #2:"와 같이 정확한 형식으로 시작하고, 그 뒤에 해당 컷의 내용을 상세하게 묘사해주세요.

**필수 반영 요소:**
`;

  if (storySettings?.mainCharacter) {
    userMessageContent += `- **주인공**: "${storySettings.mainCharacter}". 이 주인공이 이야기의 중심입니다. 주인공의 성격, 목표, 행동이 명확히 드러나도록 해주세요.\n`;
  } else {
    userMessageContent +=
      "- **주인공**: 새로운 캐릭터를 자유롭게 창조하여 이야기를 이끌어 가게 해주세요.\n";
  }

  if (productImageUrl) {
    userMessageContent += `- **핵심 소재 (상품)**: 이 스토리는 다음 URL에 있는 상품(또는 이 상품이 상징하는 것)을 중심으로 전개되어야 합니다: ${productImageUrl}. 이 상품이 스토리의 시작, 갈등, 해결 또는 중요한 전환점에 결정적인 역할을 하도록 구성해주세요. 상품의 이름이나 특징이 자연스럽게 언급되거나 시각적으로 묘사되도록 해주세요.\n`;
  }

  if (storyPrompt) {
    userMessageContent += `- **사용자 주요 요청**: "${storyPrompt}". 이 요청 사항을 스토리의 핵심 아이디어로 삼아 구체화해주세요.\n`;
  } else if (!productImageUrl && !storySettings?.mainCharacter) {
    userMessageContent +=
      "- **사용자 주요 요청**: 자유롭게 창의적인 스토리를 만들어주세요.\n";
  }

  userMessageContent += `
**세부 지침:**
1.  **언어**: 모든 내용은 반드시 ${targetLanguage}로만 작성해주세요. ${targetLanguage}가 아닌 다른 언어는 절대 사용하지 마세요.
2.  **컷 구분**: 각 컷은 반드시 "컷 #1:", "컷 #2:", "컷 #3:" ... 와 같은 형식으로 시작해야 합니다. 각 "컷 #번호:" 다음에는 바로 해당 컷의 내용이 이어져야 합니다. (예: 컷 #1: 첫 번째 장면 내용. 컷 #2: 두 번째 장면 내용.) "Scene"이라는 단어나 별도의 컷 제목을 추가하지 마세요.
3.  **내용**: 각 컷은 시각적인 장면(배경, 인물 외모, 소품), 인물의 행동, 그리고 필요한 경우 짧은 대사를 포함하여 생생하게 묘사해주세요.
4.  **분량**: 전체 스토리는 3개에서 5개 사이의 컷으로 구성해주세요.
5.  **일관성**: 이야기 전체의 흐름과 주인공의 감정선이 일관성 있게 유지되도록 해주세요.
6.  **창의성**: 독창적이고 흥미로운 방식으로 스토리를 전개해주세요.

**요약**: ${targetLanguage}로, 주인공 "${
    storySettings?.mainCharacter || "새로운 캐릭터"
  }"과 상품(URL: ${productImageUrl || "없음"})을 중심으로, 사용자의 요청 "${
    storyPrompt || "자유 주제"
  }"에 맞춰, "컷 #번호:" 형식으로 구분된 3~5개의 컷으로 구성된 스토리를 작성해주세요.
`;

  // 최종 언어 강제 지시 (API 요청 메시지 마지막에 추가)
  const finalInstructions = `\n\nIMPORTANT REMINDER: The entire response MUST be in ${targetLanguage} ONLY. Do not include any other languages. Each scene must start EXACTLY with "컷 #번호:" (if Korean) or "Cut #Number:" (if English), followed by the scene content. No other scene titles or formats.`;

  console.log("GPT 요청 시스템 메시지:", systemMessageContent);
  console.log(
    "GPT 요청 사용자 메시지:",
    userMessageContent +
      (storySettings?.language === "ko"
        ? finalInstructions.replace("Cut #Number:", "컷 #번호:")
        : finalInstructions)
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 또는 "gpt-4-turbo" / "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemMessageContent },
        {
          role: "user",
          content:
            userMessageContent +
            (storySettings?.language === "ko"
              ? finalInstructions.replace("Cut #Number:", "컷 #번호:")
              : finalInstructions),
        },
      ],
      temperature: 0.7, // 이전 값 유지 또는 약간 낮춰서(0.6~0.7) 지시사항 준수율을 높일 수 있음
    });

    let generatedStoryText = completion.choices[0]?.message?.content?.trim();

    if (!generatedStoryText) {
      throw new Error("GPT로부터 유효한 스토리 텍스트를 받지 못했습니다.");
    }

    // 후처리: 만약의 경우를 대비해 추가적인 정리 (주로 영어 응답 시 문제)
    // "Scene #X: Title" 같은 부분을 제거하고 "컷 #X:" 형식으로 통일 시도
    if (storySettings?.language === "ko") {
      // "**Scene #1: The Unveiling of the Watch**" 같은 패턴을 "컷 #1:"로 변경하거나, 해당 줄을 내용의 일부로 편입
      generatedStoryText = generatedStoryText.replace(
        /\*\*Scene\s*#?\d+\s*:\s*[^(\n|\r)]+\*\*\s*\n?/gi,
        ""
      );
      // 불필요한 "컷 #X:" 뒤의 "**" 제거
      generatedStoryText = generatedStoryText.replace(
        /(컷\s*#?\d+\s*:\s*)\*\*(.*?)\*\*/gi,
        "$1$2"
      );
    } else {
      // 영어의 경우 "Cut #X:" 형식을 사용하도록 유도했으므로, "Scene #X:" 패턴 정리
      generatedStoryText = generatedStoryText.replace(
        /\*\*Scene\s*#?\d+\s*:\s*[^(\n|\r)]+\*\*\s*\n?/gi,
        ""
      );
      generatedStoryText = generatedStoryText.replace(
        /(Cut\s*#?\d+\s*:\s*)\*\*(.*?)\*\*/gi,
        "$1$2"
      );
    }
    // 연속된 빈 줄 제거
    generatedStoryText = generatedStoryText.replace(/\n\s*\n/g, "\n\n");

    console.log("GPT 생성 스토리 (처리 후):", generatedStoryText);
    return generatedStoryText;
  } catch (error) {
    console.error(
      "GPT 스토리 생성 중 오류 발생:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "알 수 없는 GPT API 오류";
    throw new Error(`GPT API 오류: ${errorMessage}`);
  }
};
