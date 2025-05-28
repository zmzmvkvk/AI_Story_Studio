// src/store/useSettingStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useSettingStore = create((set, get) => ({
  aiMode: true,
  settings: {
    contents: { platform: "youtube", type: "shorts" },
    story: { language: "ko", mainCharacter: "" },
    image: { style: "cartoon" },
    video: { resolution: "1080p", fps: 30 },
    tts: { speaker: "female", speed: 1.0 },
  },
  loading: false, // 추가
  saving: false, // 추가
  error: null, // 추가

  setAiMode: (v) => set({ aiMode: v }),
  setSettings: (settings) => set({ settings }),

  fetchSettings: async (projectId) => {
    set({ loading: true, error: null }); // 로딩 시작
    try {
      const snap = await getDoc(doc(db, "settings", projectId));
      if (snap.exists()) {
        const data = snap.data();
        set({
          aiMode: data.aiMode ?? true,
          settings: { ...get().settings, ...data.settings },
        });
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false }); // 로딩 종료
    }
  },
  saveSettings: async (projectId) => {
    set({ saving: true, error: null }); // 저장 시작
    try {
      const { aiMode, settings } = get();
      await setDoc(
        doc(db, "settings", projectId),
        { aiMode, settings },
        { merge: true }
      );
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ saving: false }); // 저장 종료
    }
  },
}));
