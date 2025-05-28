// client/src/store/useSettingStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const platformGuide = {
  youtube: { type: "shorts", lengthDesc: "60초 미만", defaultCuts: 25 },
  instagram: { type: "reels", lengthDesc: "60초 이상", defaultCuts: 35 },
  tiktok: { type: "tiktok", lengthDesc: "60초 초과", defaultCuts: 40 },
};

export const useSettingStore = create((set, get) => ({
  aiMode: true,
  settings: {
    contents: {
      platform: "youtube",
      type: platformGuide.youtube.type,
      platformLengthDescription: platformGuide.youtube.lengthDesc,
      platformDefaultCuts: platformGuide.youtube.defaultCuts,
    },
    story: {
      language: "ko",
      mainCharacter: {
        id: "default",
        name: "기본 (AI 자유 선택)",
        imageUrl: "/placeholder-character.png",
      },
      storyDirection: "advertisement",
    },
    image: {
      stylePreset: "LEONARDO",
      customModelId: null,
      aspectRatio: "9:16",
      width: 768,
      height: 1344,
      guidanceScale: 7,
      num_images: 1,
      alchemy: true,
      photoReal: false,
      promptMagic: false,
      negative_prompt: "",
    },
    video: {
      resolution: "1080p",
      fps: 30,
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

  setSetting: (category, key, value) =>
    set((state) => {
      const newSettings = {
        ...state.settings,
        [category]: {
          ...state.settings[category],
          [key]: value,
        },
      };

      if (category === "contents" && key === "platform") {
        const guide = platformGuide[value] || platformGuide.youtube;
        newSettings.contents.type = guide.type;
        newSettings.contents.platformLengthDescription = guide.lengthDesc;
        newSettings.contents.platformDefaultCuts = guide.defaultCuts;
      }
      return { settings: newSettings };
    }),

  setSettings: (newSettings) =>
    set((state) => ({
      // 전체 설정 객체 업데이트용
      settings: {
        ...state.settings, // 기존 스토어의 기본 구조를 유지
        contents: {
          ...state.settings.contents,
          ...(newSettings.contents || {}),
        },
        story: { ...state.settings.story, ...(newSettings.story || {}) },
        image: { ...state.settings.image, ...(newSettings.image || {}) },
        video: { ...state.settings.video, ...(newSettings.video || {}) },
        tts: { ...state.settings.tts, ...(newSettings.tts || {}) },
      },
    })),

  fetchSettings: async (projectId) => {
    if (!projectId) {
      set({ loading: false, error: "projectId가 제공되지 않았습니다." });
      return;
    }
    set({ loading: true, error: null });
    try {
      const snap = await getDoc(doc(db, "settings", projectId));
      if (snap.exists()) {
        const data = snap.data();
        const fetchedSettings = data.settings || {};

        // Firestore에서 가져온 platform 값 기준으로 가이드라인 정보 설정
        const platform =
          fetchedSettings.contents?.platform ||
          get().settings.contents.platform;
        const guide = platformGuide[platform] || platformGuide.youtube;

        set({
          aiMode: data.aiMode !== undefined ? data.aiMode : get().aiMode,
          settings: {
            // 기존 스토어 구조를 유지하면서 값을 병합
            contents: {
              ...get().settings.contents, // 기본값
              ...(fetchedSettings.contents || {}), // DB 값
              type: guide.type, // 파생값 업데이트
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
        // 새 프로젝트일 경우, 현재 스토어의 기본값을 사용할 수 있도록 상태 변경 없음
        // 또는 이 시점에서 기본 설정을 Firestore에 저장할 수도 있습니다.
        // await get().saveSettings(projectId); // 예: 새 프로젝트 시 기본값 저장
        console.log(
          `Firestore에 projectId '${projectId}'에 대한 설정이 없습니다. 기본값을 사용합니다.`
        );
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
      set({ saving: false, error: "저장할 프로젝트 ID가 없습니다." });
      return Promise.reject(new Error("저장할 프로젝트 ID가 없습니다."));
    }
    set({ saving: true, error: null });
    try {
      const { aiMode, settings } = get();
      // 파생 상태(platformLengthDescription, platformDefaultCuts)는 저장할 필요 없음
      const {
        platformLengthDescription,
        platformDefaultCuts,
        ...contentsToSave
      } = settings.contents;
      const settingsToPersist = {
        ...settings,
        contents: contentsToSave,
      };

      await setDoc(
        doc(db, "settings", projectId),
        {
          aiMode,
          settings: settingsToPersist,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      set({ saving: false });
      return Promise.resolve();
    } catch (err) {
      console.error("Error saving settings:", err);
      set({ error: err.message, saving: false });
      return Promise.reject(err);
    }
  },
}));
