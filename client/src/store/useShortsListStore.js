// src/store/useShortsListStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const useShortsListStore = create((set, get) => ({
  list: [],
  loading: false,
  error: null,

  fetchList: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, "settings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const shorts = [];
      snap.forEach((sDoc) => {
        // 변수명 변경 doc -> sDoc (setDoc의 doc과 혼동 방지)
        const data = sDoc.data();
        let createdAtValue = null;
        if (data.createdAt && typeof data.createdAt.toDate === "function") {
          createdAtValue = data.createdAt.toDate().getTime(); // Date 객체로 변환 후 숫자 타임스탬프로
        } else if (data.createdAt) {
          // 이미 숫자 타임스탬프이거나 다른 유효한 값일 경우
          createdAtValue = data.createdAt;
        }

        shorts.push({
          id: sDoc.id,
          // settings 객체 내의 title과 lastStep을 우선적으로 사용하고, 없으면 data 루트의 값 사용 (데이터 구조 일관성 필요)
          title: data.settings?.title ?? data.title ?? "제목없음",
          lastStep: data.settings?.lastStep ?? data.lastStep ?? "없음",
          createdAt: createdAtValue, // 변환된 값 사용
          // thumbnail 등 나머지 필드도 settings 내부 또는 루트에서 일관되게 가져오도록 수정 필요
          thumbnail: data.settings?.thumbnail ?? data.thumbnail,
          // ...data, // 필요한 필드만 명시적으로 포함하는 것이 좋음
        });
      });
      set({ list: shorts, loading: false });
    } catch (err) {
      console.error("Error fetching list:", err); // 콘솔 에러 추가
      set({ error: err.message, loading: false });
    }
  },

  addShorts: async (id, data) => {
    await setDoc(
      doc(db, "settings", id),
      {
        settings: { ...data, title: data.title ?? "제목없음" },
        createdAt: serverTimestamp(), // 변경 후
      },
      { merge: true }
    );
    await get().fetchList(); // fetchList 호출로 목록 즉시 갱신
  },

  updateShorts: async (id, fields) => {
    await setDoc(
      doc(db, "settings", id),
      { settings: fields },
      { merge: true }
    );
    await get().fetchList();
  },

  removeShorts: async (id) => {
    await deleteDoc(doc(db, "settings", id));
    set((state) => ({
      list: state.list.filter((item) => item.id !== id),
    }));
  },
}));
