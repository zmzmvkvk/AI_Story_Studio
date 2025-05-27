// src/store/useSettingStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useSettingStore = create((set, get) => ({
  // 상태 구조
  aiMode: true,
  setAiMode: (v) => set({ aiMode: v }),
  settings: {
    contents: { platform: "youtube", type: "shorts" },
    story: { language: "ko", mainCharacter: "" },
    image: { style: "cartoon" },
    video: { resolution: "1080p", fps: 30 },
    tts: { speaker: "female", speed: 1.0 },
  },
  setSettings: (settings) => set({ settings }),

  // Firestore 연동
  fetchSettings: async (projectId) => {
    const snap = await getDoc(doc(db, "settings", projectId));
    if (snap.exists()) {
      const data = snap.data();
      set({
        aiMode: data.aiMode ?? true,
        settings: { ...get().settings, ...data.settings },
      });
    }
  },
  saveSettings: async (projectId) => {
    const { aiMode, settings } = get();
    await setDoc(
      doc(db, "settings", projectId),
      { aiMode, settings },
      { merge: true }
    );
  },
}));
