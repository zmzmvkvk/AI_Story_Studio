// server/services/gptService.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 스토리 방향 옵션 (클라이언트 StorySettings.jsx와 동기화 필요)
const storyDirectionLabels = {
  advertisement: "광고/홍보",
  comedy: "코미디/병맛",
  omnibus: "옴니버스",
  drama: "드라마/감동",
  thriller: "스릴러/미스터리",
  educational: "정보/교육",
  daily_life: "일상/브이로그",
};

export const generateStoryWithGPT = async ({
  storyPrompt,
  productImageUrl,
  projectSettings,
}) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  const contentsSettings = projectSettings?.contents || {};
  const storySettings = projectSettings?.story || {};

  let targetLanguage = "영어";
  let languageInstructions =
    "The entire story, including scene descriptions, dialogues, and actions, must be written exclusively in English.";
  if (storySettings?.language === "ko") {
    targetLanguage = "한국어";
    languageInstructions =
      "이야기 전체 (장면 묘사, 대사, 행동 지문 포함)는 반드시 한국어로만 작성되어야 합니다. 다른 언어가 조금이라도 섞이면 안 됩니다.";
  }

  const systemMessageContent = `당신은 ${targetLanguage}로 창작 활동을 하는 매우 뛰어난 영상 콘텐츠 시나리오 작가입니다. 당신의 임무는 사용자의 요청과 주어진 설정을 충실히 반영하여, 비디오 제작에 적합하도록 여러 개의 장면(컷 또는 Scene)으로 구성된 흥미로운 스토리를 만드는 것입니다. 각 장면은 명확하게 "컷 #번호:" 형식으로 시작해야 하며, 다른 추가적인 장면 제목(예: Scene #X: Title)은 포함하지 마십시오. 오직 "컷 #번호:" 형식만 사용해야 합니다. ${languageInstructions}`;

  // 플랫폼 설정에서 가져온 길이 설명과 기본 컷 수 사용
  const platformLengthDesc =
    contentsSettings.platformLengthDescription || "지정된 길이의";
  const approximateCuts =
    contentsSettings.platformDefaultCuts ||
    (contentsSettings.type === "shorts" ? 3 : 5);

  let userMessageContent = `
다음 요구사항을 바탕으로 ${contentsSettings?.platform || "지정된 플랫폼"}용 ${
    contentsSettings?.type || "지정된 유형의 영상"
  } (${platformLengthDesc}) 스토리를 약 ${approximateCuts}개의 컷으로 구성하여 작성해주세요.
각 컷은 "컷 #1:", "컷 #2:"와 같이 정확한 형식으로 시작하고, 그 뒤에 해당 컷의 내용을 상세하게 묘사해주세요.

**필수 반영 요소:**
`;

  if (
    storySettings?.mainCharacter &&
    storySettings.mainCharacter.id !== "default" &&
    storySettings.mainCharacter.name
  ) {
    userMessageContent += `- **주인공**: "${storySettings.mainCharacter.name}". 이 주인공이 이야기의 중심입니다. 주인공의 성격, 목표, 행동이 명확히 드러나도록 해주세요.\n`;
  } else {
    userMessageContent +=
      "- **주인공**: 새로운 캐릭터를 자유롭게 창조하여 이야기를 이끌어 가게 해주세요.\n";
  }

  if (productImageUrl) {
    userMessageContent += `- **핵심 소재 (상품)**: 이 스토리는 다음 URL에 있는 상품(또는 이 상품이 상징하는 것)을 중심으로 전개되어야 합니다: ${productImageUrl}. 이 상품이 스토리의 시작, 갈등, 해결 또는 중요한 전환점에 결정적인 역할을 하도록 구성해주세요. 상품의 이름이나 특징이 자연스럽게 언급되거나 시각적으로 묘사되도록 해주세요.\n`;
  }

  if (storyPrompt) {
    userMessageContent += `- **사용자 주요 요청/아이디어**: "${storyPrompt}". 이 요청 사항을 스토리의 핵심 아이디어로 삼아 구체화해주세요.\n`;
  }

  if (storySettings?.storyDirection) {
    const directionLabel =
      storyDirectionLabels[storySettings.storyDirection] ||
      storySettings.storyDirection;
    userMessageContent += `- **스토리 방향/분위기**: "${directionLabel}". 이 분위기를 전체 스토리에 걸쳐 잘 표현해주세요.\n`;
  }

  userMessageContent += `
**세부 지침:**
1.  **언어**: 모든 내용은 반드시 ${targetLanguage}로만 작성해주세요. ${targetLanguage}가 아닌 다른 언어는 절대 사용하지 마세요.
2.  **컷 구분**: 각 컷은 반드시 "컷 #1:", "컷 #2:", "컷 #3:" ... 와 같은 형식으로 시작해야 합니다. 각 "컷 #번호:" 다음에는 바로 해당 컷의 내용이 이어져야 합니다. "Scene"이라는 단어나 별도의 컷 제목을 추가하지 마세요.
3.  **내용**: 각 컷은 시각적인 장면(배경, 인물 외모, 소품), 인물의 행동, 그리고 필요한 경우 짧은 대사(간결하게)를 포함하여 생생하게 묘사해주세요. 영상 콘텐츠임을 감안하여 너무 긴 설명보다는 시각적 전달에 집중해주세요.
4.  **분량 및 컷 수**: 전체 스토리는 목표 길이(${platformLengthDesc})에 맞춰 약 ${approximateCuts}개의 컷으로 자연스럽게 구성해주세요. 각 컷은 대략 2~3초 분량으로 생각하고 작성하되, 내용에 따라 유동적으로 조절 가능합니다. (예: ${approximateCuts}컷이면 총 ${
    approximateCuts * 2
  }~${approximateCuts * 3}초 내외)
5.  **일관성**: 이야기 전체의 흐름과 주인공의 감정선이 일관성 있게 유지되도록 해주세요.
6.  **창의성**: 독창적이고 흥미로운 방식으로 스토리를 전개해주세요.

**요약**: ${targetLanguage}로, 주인공 "${
    storySettings?.mainCharacter?.name || "새로운 캐릭터"
  }"과 상품(URL: ${productImageUrl || "없음"})을 중심으로, 사용자의 요청 "${
    storyPrompt || "자유 주제"
  }" 및 스토리 방향 "${
    storyDirectionLabels[storySettings.storyDirection] ||
    storySettings.storyDirection ||
    "지정되지 않음"
  }"에 맞춰, "컷 #번호:" 형식으로 구분된 ${approximateCuts}개 내외의 컷으로 구성된, ${platformLengthDesc} 영상을 위한 스토리를 작성해주세요.
`;

  const finalInstructions = `\n\nIMPORTANT REMINDER: The entire response MUST be in ${targetLanguage} ONLY. Each scene must start EXACTLY with "${
    storySettings?.language === "ko" ? "컷 #번호:" : "Cut #Number:"
  }", followed by the scene content. No other scene titles or formats. Ensure approximately ${approximateCuts} cuts suitable for a ${platformLengthDesc} video.`;

  console.log("GPT 요청 시스템 메시지:", systemMessageContent);
  console.log(
    "GPT 요청 사용자 메시지 (최종 지시 포함):",
    userMessageContent + finalInstructions
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 또는 "gpt-4-turbo", "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemMessageContent },
        { role: "user", content: userMessageContent + finalInstructions },
      ],
      temperature: 0.7,
    });

    let generatedStoryText = completion.choices[0]?.message?.content?.trim();
    if (!generatedStoryText) {
      throw new Error("GPT로부터 유효한 스토리 텍스트를 받지 못했습니다.");
    }
    // 후처리 (필요시)
    if (storySettings?.language === "ko") {
      generatedStoryText = generatedStoryText.replace(
        /\*\*Scene\s*#?\d+\s*:\s*[^(\n|\r)]+\*\*\s*\n?/gi,
        ""
      );
      generatedStoryText = generatedStoryText.replace(
        /(컷\s*#?\d+\s*:\s*)\*\*(.*?)\*\*/gi,
        "$1$2"
      );
    } else {
      generatedStoryText = generatedStoryText.replace(
        /\*\*Scene\s*#?\d+\s*:\s*[^(\n|\r)]+\*\*\s*\n?/gi,
        ""
      );
      generatedStoryText = generatedStoryText.replace(
        /(Cut\s*#?\d+\s*:\s*)\*\*(.*?)\*\*/gi,
        "$1$2"
      );
    }
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
