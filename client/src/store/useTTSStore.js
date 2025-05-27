// src/store/useTTSStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useTTSStore = create((set, get) => ({
  tracks: [],

  setTracks: (tracks) => set({ tracks }),

  addTrack: (track) =>
    set((state) => ({
      tracks: [...state.tracks, track],
    })),

  updateTrack: (id, data) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    })),

  clearTracks: () => set({ tracks: [] }),

  fetchTracks: async (docId) => {
    const snap = await getDoc(doc(db, "tts", docId));
    if (snap.exists()) set({ tracks: snap.data().tracks || [] });
    else set({ tracks: [] });
  },

  saveTracks: async (docId) => {
    const { tracks } = get();
    await setDoc(doc(db, "tts", docId), { tracks }, { merge: true });
  },
}));
