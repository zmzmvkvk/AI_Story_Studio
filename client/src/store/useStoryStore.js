// src/store/useStoryStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const useStoryStore = create((set, get) => ({
  story: null, // Firestore에서 불러온 스토리 데이터 { id, projectId, cutscenes, productImageUrl, storyPrompt, aiMode, createdAt, updatedAt }
  loading: false,
  error: null,

  fetchStory: async (storyId, projectId) => {
    // projectId도 받을 수 있도록 추가 (새 스토리 생성 시 사용)
    if (!storyId) {
      set({
        story: {
          // storyId가 없을 경우 (예: 경로에 아직 없을 때) 또는 새 스토리일 때의 기본 구조
          id: null, // 아직 ID가 없음 (컴포넌트에서 생성 후 save 시 할당)
          projectId: projectId || null,
          cutscenes: [],
          productImageUrl: "",
          storyPrompt: "",
          aiMode: true, // 기본값, 설정에서 가져온 값으로 덮어쓸 수 있음
        },
        loading: false,
        error: "Story ID not provided, initialized a new story structure.",
      });
      return;
    }
    set({ loading: true, error: null, story: null }); // 이전 스토리 데이터 초기화
    try {
      const snap = await getDoc(doc(db, "stories", storyId));
      if (snap.exists()) {
        set({ story: { id: storyId, ...snap.data() }, loading: false });
      } else {
        // Firestore에 해당 storyId의 문서가 없을 경우, 새 스토리 기본 구조로 설정
        set({
          story: {
            id: storyId, // URL에서 가져온 storyId 사용
            projectId: projectId, // URL에서 가져온 projectId 사용
            cutscenes: [],
            productImageUrl: "",
            storyPrompt: "",
            aiMode: true, // 기본값, 실제 사용 시 설정(useSettingStore)의 aiMode를 참고
            createdAt: null, // 첫 저장 시 생성됨
            updatedAt: null, // 첫 저장 시 생성됨
          },
          loading: false,
          error: null, // 오류는 아님, 새 스토리임
        });
      }
    } catch (err) {
      console.error("Error fetching story:", err);
      set({ error: err.message, loading: false });
    }
  },

  // StoryEditor에서 사용될 저장 액션
  saveStoryData: async (storyPayload) => {
    // storyPayload: { id (storyId), projectId, cutscenes, productImageUrl, storyPrompt, aiModeFromSettings }
    if (!storyPayload || !storyPayload.id) {
      const errMsg = "Story ID is missing. Cannot save.";
      set({ error: errMsg, loading: false });
      console.error(errMsg);
      return Promise.reject(new Error(errMsg));
    }
    set({ loading: true, error: null });

    const currentStoryInStore = get().story;

    const storyToPersist = {
      id: storyPayload.id, // storyId
      projectId: storyPayload.projectId,
      cutscenes: storyPayload.cutscenes, // StoryEditor의 storyData (컷 배열)
      productImageUrl: storyPayload.productImageUrl,
      storyPrompt: storyPayload.storyPrompt,
      aiMode: storyPayload.aiMode, // 저장 시점의 AI 모드
      updatedAt: serverTimestamp(),
      // createdAt은 기존 문서가 있으면 유지, 없으면 새로 생성
      createdAt:
        currentStoryInStore?.createdAt instanceof Object
          ? currentStoryInStore.createdAt
          : serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "stories", storyToPersist.id), storyToPersist, {
        merge: true,
      });
      // Firestore에서 serverTimestamp가 실제 시간으로 변환된 후 다시 fetch하거나,
      // 로컬에서 낙관적 업데이트를 위해 storyToPersist를 그대로 사용 (단, timestamp는 아직 객체)
      set({
        story: { ...storyToPersist, updatedAt: new Date() }, // 로컬에서는 Date 객체로 보여줌 (실제 Firestore는 Timestamp)
        loading: false,
      });
      return Promise.resolve();
    } catch (err) {
      console.error("Error saving story:", err);
      set({ error: err.message, loading: false });
      return Promise.reject(err);
    }
  },

  // 스토어의 story 상태를 직접 업데이트하는 액션 (필요시 사용)
  updateLocalStoryState: (updatedFields) => {
    set((state) => ({
      story: state.story ? { ...state.story, ...updatedFields } : updatedFields,
    }));
  },
}));
