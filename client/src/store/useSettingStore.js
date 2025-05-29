// client/src/store/useSettingStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const platformGuide = {
  youtube: { type: "shorts", lengthDesc: "60초 미만", defaultCuts: 25 },
  instagram: { type: "reels", lengthDesc: "60초 이상", defaultCuts: 35 },
  tiktok: { type: "tiktok", lengthDesc: "60초 초과", defaultCuts: 40 },
};

const defaultImageSettings = {
  stylePreset: "LEONARDO",
  customModelId: null,
  aspectRatio: "9:16",
  width: 768,
  height: 1344,
  num_images: 1,
  guidance_scale: 7,
  alchemy: true,
  photoReal: false,
  promptMagic: false,
  negative_prompt: "",
  scheduler: "EULER_DISCRETE",
  sd_version: "SDXL_1_0",
  enhancePrompt: false,
  enhancePromptInstructions: "",
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
    image: { ...defaultImageSettings },
    video: { resolution: "1080p", fps: 30 },
    tts: { speaker: "female", speed: 1.0 },
  },
  loading: false,
  saving: false,
  error: null,

  setAiMode: (v) => set({ aiMode: v }),

  setSetting: (category, key, value) =>
    set((state) => {
      let newCategorySettings = { ...state.settings[category], [key]: value };
      if (category === "contents" && key === "platform") {
        const guide = platformGuide[value] || platformGuide.youtube;
        newCategorySettings.type = guide.type;
        newCategorySettings.platformLengthDescription = guide.lengthDesc;
        newCategorySettings.platformDefaultCuts = guide.defaultCuts;
      }
      return {
        settings: { ...state.settings, [category]: newCategorySettings },
      };
    }),

  _updateSettingsFromFetchedData: (
    fetchedData // fetchSettings 내부에서만 사용
  ) =>
    set((state) => {
      const fetchedSettings = fetchedData.settings || {};
      const platform =
        fetchedSettings.contents?.platform || state.settings.contents.platform;
      const guide = platformGuide[platform] || platformGuide.youtube;

      return {
        aiMode:
          fetchedData.aiMode !== undefined ? fetchedData.aiMode : state.aiMode,
        settings: {
          contents: {
            ...state.settings.contents,
            ...(fetchedSettings.contents || {}),
            type: guide.type,
            platformLengthDescription: guide.lengthDesc,
            platformDefaultCuts: guide.defaultCuts,
          },
          story: { ...state.settings.story, ...(fetchedSettings.story || {}) },
          image: {
            ...defaultImageSettings,
            ...state.settings.image,
            ...(fetchedSettings.image || {}),
          },
          video: { ...state.settings.video, ...(fetchedSettings.video || {}) },
          tts: { ...state.settings.tts, ...(fetchedSettings.tts || {}) },
        },
      };
    }),

  fetchSettings: async (projectId) => {
    if (!projectId) {
      set({ loading: false, error: "projectId가 제공되지 않았습니다." });
      return;
    }
    set({ loading: true, error: null });
    try {
      const snap = await getDoc(doc(db, "settings", projectId));
      if (snap.exists()) {
        get()._updateSettingsFromFetchedData(snap.data());
      } else {
        console.log(
          `Firestore에 projectId '${projectId}'에 대한 설정이 없습니다. 스토어의 현재 (기본)값을 사용합니다.`
        );
        // 새 프로젝트면, 현재 스토어의 초기값을 사용. 저장 시 이 값이 쓰임.
        // 또는 여기서 await get().saveSettings(projectId); 호출하여 기본값을 DB에 즉시 저장 가능
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
      const { ...contentsToSave } = settings.contents;
      const settingsToPersist = { ...settings, contents: contentsToSave };

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
