// src/store/useEditStore.js
import { create } from "zustand";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
// 다른 스토어에서 직접 데이터를 가져오기보다는, 컴포넌트 레벨에서 필요한 데이터를 준비하여 액션에 전달하는 것을 권장합니다.
// 이 스토어는 '편집 상태' 자체에만 집중합니다.

export const useEditStore = create((set, get) => ({
  // --- STATE ---
  editSessionId: null, // 현재 편집 중인 프로젝트/스토리 ID와 동일하게 사용

  // 편집될 컷들의 시퀀스 및 각 컷의 편집 정보
  // 각 cut: { id (시퀀스 내 고유 ID), storyCutId (원본 스토리 컷 ID), title, textPreview,
  //            assetType ('image' | 'motion'), imageUrl, motionVideoUrl, ttsAudioUrl,
  //            duration (초), transitionToNext ('none' | 'fade' | 'slide'), order }
  editSequence: [],

  backgroundMusic: {
    url: null,
    volume: 0.5,
  },

  outputSettings: {
    // 기본값은 globalSettings에서 가져와 초기화
    resolution: "1080p",
    fps: 30,
  },

  isRenderingVideoFile: false, // 실제 비디오 파일 생성 중 상태
  lastRenderedVideoUrl: null, // 최종 렌더링된 비디오 파일 URL

  isLoading: false, // Firestore에서 편집 데이터 로딩 중 상태
  isSaving: false, // Firestore로 편집 데이터 저장 중 상태
  error: null,

  // --- ACTIONS ---

  /**
   * 편집 세션을 초기화합니다.
   * Firestore에서 기존 편집 데이터를 불러오거나,
   * 원본 스토리 컷들을 기반으로 새로운 편집 시퀀스를 구성합니다.
   */
  initializeEditSession: async (
    sessionId,
    originalStoryCuts = [],
    globalVideoSettings = { resolution: "1080p", fps: 30 }
  ) => {
    set({
      isLoading: true,
      error: null,
      editSessionId: sessionId,
      editSequence: [],
    });
    try {
      const editDocRef = doc(db, "edits", sessionId); // 'edits' 컬렉션 사용
      const snap = await getDoc(editDocRef);

      if (snap.exists()) {
        const data = snap.data();
        set({
          editSequence: data.editSequence || [],
          backgroundMusic: data.backgroundMusic || { url: null, volume: 0.5 },
          outputSettings: data.outputSettings || globalVideoSettings,
          lastRenderedVideoUrl: data.lastRenderedVideoUrl || null,
          isLoading: false,
        });
      } else if (originalStoryCuts.length > 0) {
        // 저장된 편집 데이터가 없고, 원본 스토리 컷이 있다면 이를 기반으로 초기 시퀀스 생성
        const initialSequence = originalStoryCuts.map((storyCut, index) => ({
          id: `seq-item-${storyCut.id || index}-${Date.now()}`, // 시퀀스 아이템의 고유 ID
          storyCutId: storyCut.id || `cut-${index}`, // 원본 스토리 컷 ID
          title: storyCut.title || `컷 ${index + 1}`,
          textPreview:
            storyCut.text?.substring(0, 50) +
            (storyCut.text?.length > 50 ? "..." : ""), // 간단한 텍스트 미리보기
          assetType: storyCut.motionVideoUrl
            ? "motion"
            : storyCut.imageUrl
            ? "image"
            : "none", // 에셋 타입 결정
          imageUrl: storyCut.imageUrl || null,
          motionVideoUrl: storyCut.motionVideoUrl || null, // Video.jsx에서 생성된 모션 URL
          ttsAudioUrl: storyCut.ttsAudioUrl || null, // TTS.jsx에서 생성된 오디오 URL
          duration: storyCut.duration || 3.0, // 기본 3초 또는 에셋 길이에 따라
          transitionToNext: "none", // 다음 컷으로의 전환 효과
          order: index,
        }));
        set({
          editSequence: initialSequence,
          outputSettings: globalVideoSettings, // 전역 설정을 기본으로 사용
          isLoading: false,
        });
      } else {
        // 불러올 데이터도, 초기화할 원본 컷도 없는 경우
        set({ isLoading: false, editSequence: [] });
      }
    } catch (err) {
      console.error("Error initializing edit session:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  saveEditSession: async () => {
    const {
      editSessionId,
      editSequence,
      backgroundMusic,
      outputSettings,
      lastRenderedVideoUrl,
    } = get();
    if (!editSessionId) {
      const errorMsg = "편집 세션 ID가 없어 저장할 수 없습니다.";
      set({ error: errorMsg, isSaving: false });
      return Promise.reject(new Error(errorMsg));
    }
    set({ isSaving: true, error: null });
    try {
      const dataToSave = {
        editSequence,
        backgroundMusic,
        outputSettings,
        lastRenderedVideoUrl,
        updatedAt: serverTimestamp(),
        // createdAt은 문서 최초 생성 시 자동으로 (merge:true 사용 시)
      };
      await setDoc(doc(db, "edits", editSessionId), dataToSave, {
        merge: true,
      });
      set({ isSaving: false });
      return Promise.resolve();
    } catch (err) {
      console.error("Error saving edit session:", err);
      set({ error: err.message, isSaving: false });
      return Promise.reject(err);
    }
  },

  // --- 시퀀스 조작 액션 ---
  setSequence: (newSequence) =>
    set({
      editSequence: newSequence.map((item, index) => ({
        ...item,
        order: index,
      })),
    }),

  updateCutProperties: (sequenceItemId, updatedProps) =>
    set((state) => ({
      editSequence: state.editSequence.map((cut) =>
        cut.id === sequenceItemId ? { ...cut, ...updatedProps } : cut
      ),
    })),

  addCutToSequence: (
    storyCutAsset // storyCutAsset: { storyCutId, title, textPreview, imageUrl, motionVideoUrl, ttsAudioUrl, duration? }
  ) =>
    set((state) => {
      const newSequenceItem = {
        id: `seq-item-${storyCutAsset.storyCutId}-${Date.now()}`,
        duration: 3.0, // 기본값
        transitionToNext: "none",
        ...storyCutAsset, // storyCutId, title, 에셋 URL 등 포함
        order: state.editSequence.length,
      };
      return { editSequence: [...state.editSequence, newSequenceItem] };
    }),

  removeCutFromSequence: (sequenceItemId) =>
    set((state) => ({
      editSequence: state.editSequence
        .filter((cut) => cut.id !== sequenceItemId)
        .map((item, index) => ({ ...item, order: index })), // 순서 재정렬
    })),

  reorderSequence: (sourceIndex, destinationIndex) => {
    set((state) => {
      const newSequence = Array.from(state.editSequence);
      const [movedItem] = newSequence.splice(sourceIndex, 1);
      newSequence.splice(destinationIndex, 0, movedItem);
      return {
        editSequence: newSequence.map((item, index) => ({
          ...item,
          order: index,
        })),
      };
    });
  },

  // --- 배경음악 액션 ---
  setBackgroundMusic: (url, volume = 0.5) =>
    set((state) => ({
      backgroundMusic: { ...state.backgroundMusic, url, volume },
    })),
  clearBackgroundMusic: () =>
    set((state) => ({
      backgroundMusic: { ...state.backgroundMusic, url: null },
    })),
  setBackgroundMusicVolume: (volume) =>
    set((state) => ({ backgroundMusic: { ...state.backgroundMusic, volume } })),

  // --- 출력 설정 액션 ---
  updateOutputSetting: (key, value) =>
    set((state) => ({
      outputSettings: { ...state.outputSettings, [key]: value },
    })),

  // --- 비디오 파일 렌더링 요청 ---
  requestFinalVideoRender: async () => {
    const { editSessionId, editSequence, backgroundMusic, outputSettings } =
      get();
    if (!editSessionId || editSequence.length === 0) {
      set({ error: "렌더링할 컷이 시퀀스에 없습니다." });
      return;
    }
    set({
      isRenderingVideoFile: true,
      error: null,
      lastRenderedVideoUrl: null,
    });
    try {
      console.log("Requesting final video render with data:", {
        editSessionId,
        editSequence,
        backgroundMusic,
        outputSettings,
      });
      // TODO: 실제 백엔드 API 호출하여 렌더링 작업 요청
      // const renderResult = await callBackendRenderAPI(payload);
      await new Promise((resolve) => setTimeout(resolve, 7000)); // 7초 렌더링 시뮬레이션
      const mockRenderedUrl = `/fake-rendered-videos/${editSessionId}-${Date.now()}.mp4`;

      set({
        isRenderingVideoFile: false,
        lastRenderedVideoUrl: mockRenderedUrl,
      });
      // 렌더링 완료 후 저장 (선택적, lastRenderedVideoUrl을 Firestore에 기록)
      await get().saveEditSession();
    } catch (err) {
      console.error("Error requesting final video render:", err);
      set({ error: err.message, isRenderingVideoFile: false });
    }
  },
}));
