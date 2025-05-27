// src/store/useImageStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useImageStore = create((set, get) => ({
  images: {},

  setImage: (sceneId, img) =>
    set((state) => ({
      images: { ...state.images, [sceneId]: img },
    })),

  removeImage: (sceneId) =>
    set((state) => {
      const next = { ...state.images };
      delete next[sceneId];
      return { images: next };
    }),

  clearImages: () => set({ images: {} }),

  setImages: (images) => set({ images }),

  fetchImages: async (docId) => {
    const snap = await getDoc(doc(db, "images", docId));
    if (snap.exists()) set({ images: snap.data().images || {} });
    else set({ images: {} });
  },

  saveImages: async (docId) => {
    const { images } = get();
    await setDoc(doc(db, "images", docId), { images }, { merge: true });
  },
}));
