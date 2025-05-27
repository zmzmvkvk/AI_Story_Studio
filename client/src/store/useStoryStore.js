// src/store/useStoryStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useStoryStore = create((set, get) => ({
  story: null,

  setStory: (story) => set({ story }),
  updateStory: (fields) =>
    set((state) => ({ story: { ...state.story, ...fields } })),
  clearStory: () => set({ story: null }),

  addCutscene: (cutscene) =>
    set((state) => ({
      story: {
        ...state.story,
        cutscenes: [...(state.story?.cutscenes || []), cutscene],
      },
    })),
  updateCutscene: (sceneId, data) =>
    set((state) => ({
      story: {
        ...state.story,
        cutscenes: state.story.cutscenes.map((cs) =>
          cs.sceneId === sceneId ? { ...cs, ...data } : cs
        ),
      },
    })),
  removeCutscene: (sceneId) =>
    set((state) => ({
      story: {
        ...state.story,
        cutscenes: state.story.cutscenes.filter((cs) => cs.sceneId !== sceneId),
      },
    })),
  reorderCutscenes: (startIdx, endIdx) =>
    set((state) => {
      const cutscenes = Array.from(state.story.cutscenes);
      const [removed] = cutscenes.splice(startIdx, 1);
      cutscenes.splice(endIdx, 0, removed);
      return { story: { ...state.story, cutscenes } };
    }),

  fetchStory: async (storyId) => {
    const snap = await getDoc(doc(db, "stories", storyId));
    if (snap.exists()) set({ story: { id: storyId, ...snap.data() } });
    else set({ story: null });
  },

  saveStory: async () => {
    const { story } = get();
    if (!story || !story.id) throw new Error("저장할 스토리 없음");
    await setDoc(doc(db, "stories", story.id), story, { merge: true });
  },
}));
