// src/store/useVideoStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useVideoStore = create((set, get) => ({
  // 현재 비디오(메타데이터)
  video: null,

  setVideo: (video) => set({ video }),
  updateVideo: (fields) =>
    set((state) => ({ video: { ...state.video, ...fields } })),
  clearVideo: () => set({ video: null }),

  setSequence: (sequence) =>
    set((state) => ({
      video: { ...state.video, sequence },
    })),
  updateSceneInSequence: (sceneId, data) =>
    set((state) => ({
      video: {
        ...state.video,
        sequence: state.video.sequence.map((cut) =>
          cut.sceneId === sceneId ? { ...cut, ...data } : cut
        ),
      },
    })),
  removeSceneFromSequence: (sceneId) =>
    set((state) => ({
      video: {
        ...state.video,
        sequence: state.video.sequence.filter((cut) => cut.sceneId !== sceneId),
      },
    })),

  fetchVideo: async (videoId) => {
    const snap = await getDoc(doc(db, "videos", videoId));
    if (snap.exists()) set({ video: { id: videoId, ...snap.data() } });
    else set({ video: null });
  },

  saveVideo: async () => {
    const { video } = get();
    if (!video || !video.id) throw new Error("저장할 비디오 없음");
    await setDoc(doc(db, "videos", video.id), video, { merge: true });
  },
}));
