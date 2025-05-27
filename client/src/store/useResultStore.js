// src/store/useResultStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useResultStore = create((set, get) => ({
  // 결과 리스트 (이미지/비디오)
  results: [], // [{ id, type: 'image'|'video', url, title, createdAt, ... }]

  setResults: (results) => set({ results }),

  addResult: (result) =>
    set((state) => ({
      results: [result, ...state.results],
    })),

  updateResult: (id, data) =>
    set((state) => ({
      results: state.results.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  removeResult: (id) =>
    set((state) => ({
      results: state.results.filter((r) => r.id !== id),
    })),

  clearResults: () => set({ results: [] }),

  // Firestore에서 불러오기 (예: 유저ID or 프로젝트ID 기준)
  fetchResults: async (docId) => {
    const snap = await getDoc(doc(db, "results", docId));
    if (snap.exists()) set({ results: snap.data().results || [] });
    else set({ results: [] });
  },

  // Firestore에 저장
  saveResults: async (docId) => {
    const { results } = get();
    await setDoc(doc(db, "results", docId), { results }, { merge: true });
  },
}));
