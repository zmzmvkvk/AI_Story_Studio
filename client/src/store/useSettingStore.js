// client/src/store/useSettingStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase"; // Firestore 직접 접근 시 사용
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// 플랫폼별 기본 콘텐츠 유형 및 스토리 길이/컷 수 가이드라인
// 이 값들은 GPT 프롬프트 생성 시 참고용으로 사용됩니다.
const platformGuide = {
  youtube: { type: "shorts", lengthDesc: "60초 미만", defaultCuts: 25 },
  instagram: { type: "reels", lengthDesc: "60초 이상", defaultCuts: 35 },
  tiktok: { type: "tiktok", lengthDesc: "60초 초과", defaultCuts: 40 },
};

export const useSettingStore = create((set, get) => ({
  aiMode: true,
  settings: {
    contents: {
      platform: "youtube", // 'youtube', 'instagram', 'tiktok'
      type: platformGuide.youtube.type, // 플랫폼에 따라 자동 설정
      // 아래 값들은 GPT 프롬프트 생성 시 참고용, ContentsSettings.jsx에서 업데이트
      platformLengthDescription: platformGuide.youtube.lengthDesc,
      platformDefaultCuts: platformGuide.youtube.defaultCuts,
    },
    story: {
      language: "ko",
      mainCharacter: {
        // 객체로 변경
        id: "default", // 캐릭터 고유 ID 또는 이름
        name: "기본 (AI 자유 선택)",
        imageUrl: "/placeholder-character.png", // 기본 캐릭터 이미지 URL (public 폴더에 위치)
      },
      storyDirection: "advertisement", // 'advertisement', 'comedy', 'omnibus', 'drama', 'thriller', 'educational', 'daily_life'
    },
    image: {
      stylePreset: "LEONARDO", // Leonardo AI의 Photography, Anime 등 preset style. API 문서 확인 필요
      customModelId: null, // 사용자가 학습시킨 커스텀 모델 ID
      aspectRatio: "9:16", // '9:16', '16:9', '1:1', '4:3', '3:4' 등
      width: 768, // aspectRatio에 따라 자동 또는 수동 설정
      height: 1344, // aspectRatio에 따라 자동 또는 수동 설정
      guidanceScale: 7, // 이미지 생성 시 프롬프트 충실도 (Leonardo AI: 1-20)
      // Leonardo AI 이미지 생성 옵션 추가 (예시)
      num_images: 1, // 생성할 이미지 수
      alchemy: true, // Leonardo Alchemy 사용 여부 (v1 기준, v2는 다를 수 있음)
      photoReal: false, // (Alchemy v2 또는 별도 옵션) 실사 이미지 강화
      promptMagic: false, // (Alchemy v2 또는 별도 옵션) 프롬프트 자동 개선
      negative_prompt: "", // 네거티브 프롬프트
      // controlNet: { enabled: false, type: 'POSE', strength: 0.5, controlImageId: null }, // 고급 기능
    },
    video: {
      resolution: "1080p", // 최종 비디오 출력 해상도 (예: '1080x1920')
      fps: 30,
      // motionStrength: 5, // Leonardo AI Image-to-Motion 옵션 (1-10)
    },
    tts: {
      speaker: "female",
      speed: 1.0,
    },
  },
  loading: false,
  saving: false,
  error: null,

  setAiMode: (v) => set({ aiMode: v }),

  // 단일 설정 항목 업데이트 (계층적 구조 지원)
  // 예: setSetting('story', 'mainCharacter', newCharacterObject)
  // 예: setSetting('image', 'guidanceScale', 10)
  setSetting: (category, key, value) =>
    set((state) => {
      const newSettings = {
        ...state.settings,
        [category]: {
          ...state.settings[category],
          [key]: value,
        },
      };

      // 플랫폼 변경 시 콘텐츠 유형 및 가이드라인 자동 업데이트
      if (category === "contents" && key === "platform") {
        const guide = platformGuide[value] || platformGuide.youtube;
        newSettings.contents.type = guide.type;
        newSettings.contents.platformLengthDescription = guide.lengthDesc;
        newSettings.contents.platformDefaultCuts = guide.defaultCuts;
      }

      // 화면 비율 변경 시 width, height 자동 업데이트 (aspectRatioOptions에서 가져와야 함)
      // 이 로직은 ImageSettings.jsx 내에서 handleAspectRatioSelect 시 직접 onSettingChange를 여러 번 호출하는 것으로 대체됨

      return { settings: newSettings };
    }),

  // 전체 settings 객체를 한 번에 업데이트 (fetchSettings 등에서 사용)
  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  fetchSettings: async (projectId) => {
    if (!projectId) {
      console.warn("fetchSettings: projectId가 제공되지 않았습니다.");
      // projectId가 없으면 기본값으로 두거나, 초기화된 상태를 유지
      // 또는 새로운 프로젝트일 경우 기본값을 Firestore에 저장하는 로직 추가 가능
      return;
    }
    set({ loading: true, error: null });
    try {
      const snap = await getDoc(doc(db, "settings", projectId));
      if (snap.exists()) {
        const data = snap.data();
        // Firestore에서 가져온 설정으로 스토어 상태 업데이트
        // 중첩된 객체까지 깊은 병합이 필요할 수 있으나, 여기서는 최상위 aiMode와 settings만 처리
        const fetchedSettings = data.settings || {};

        // 플랫폼 변경에 따른 가이드라인 정보도 함께 업데이트
        const platform =
          fetchedSettings.contents?.platform ||
          get().settings.contents.platform;
        const guide = platformGuide[platform] || platformGuide.youtube;

        set({
          aiMode: data.aiMode !== undefined ? data.aiMode : get().aiMode,
          settings: {
            ...get().settings, // 기본 틀 유지
            ...fetchedSettings, // DB에서 가져온 설정으로 덮어쓰기
            contents: {
              // contents는 가이드라인 정보 때문에 특별 처리
              ...get().settings.contents,
              ...(fetchedSettings.contents || {}),
              type: guide.type,
              platformLengthDescription: guide.lengthDesc,
              platformDefaultCuts: guide.defaultCuts,
            },
            story: {
              ...get().settings.story,
              ...(fetchedSettings.story || {}),
            },
            image: {
              ...get().settings.image,
              ...(fetchedSettings.image || {}),
            },
            video: {
              ...get().settings.video,
              ...(fetchedSettings.video || {}),
            },
            tts: { ...get().settings.tts, ...(fetchedSettings.tts || {}) },
          },
        });
      } else {
        // Firestore에 해당 projectId의 설정이 없는 경우 (새 프로젝트)
        // 현재 스토어의 기본값을 Firestore에 저장할 수도 있음 (선택적)
        console.log(
          `Firestore에 projectId '${projectId}'에 대한 설정이 없습니다. 기본값을 사용합니다.`
        );
        // 이 경우, 현재 스토어의 초기 기본값이 사용됨.
        // 필요하다면 여기서 saveSettings를 호출하여 기본값을 DB에 쓸 수 있음.
        // await get().saveSettings(projectId); // 예시: 새 프로젝트 시 기본값 저장
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  saveSettings: async (projectId) => {
    if (!projectId) {
      console.error("saveSettings: projectId가 제공되지 않았습니다.");
      set({ saving: false, error: "저장할 프로젝트 ID가 없습니다." });
      return Promise.reject(new Error("저장할 프로젝트 ID가 없습니다."));
    }
    set({ saving: true, error: null });
    try {
      const { aiMode, settings } = get();
      // settings 객체에서 내부적으로 관리되는 platformLengthDescription, platformDefaultCuts 제외하고 저장 가능
      const settingsToSave = { ...settings };
      // delete settingsToSave.contents.platformLengthDescription; // 저장 불필요
      // delete settingsToSave.contents.platformDefaultCuts;   // 저장 불필요

      await setDoc(
        doc(db, "settings", projectId),
        {
          aiMode,
          settings: settingsToSave, // 순수 설정값만 저장
          updatedAt: serverTimestamp(), // 업데이트 타임스탬프
        },
        { merge: true } // 기존 필드는 유지하고 변경된 필드만 업데이트 또는 추가
      );
      set({ saving: false, error: null }); // 성공 시 에러 null로 초기화
      return Promise.resolve();
    } catch (err) {
      console.error("Error saving settings:", err);
      set({ error: err.message, saving: false });
      return Promise.reject(err);
    }
  },
}));
