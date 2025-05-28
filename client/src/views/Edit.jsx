// src/views/Edit.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

// Zustand 스토어들
import { useSettingStore } from "../store/useSettingStore";
import { useStoryStore } from "../store/useStoryStore";
import { useEditStore } from "../store/useEditStore";

// 아이콘
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Film,
  RefreshCw,
  Play,
  Pause,
  Maximize,
  Settings2,
  GripVertical,
  Trash2,
  PlusCircle,
  ListChecks,
  Image as ImageIcon,
  MicVocal as TTSIcon,
  Video as MotionIcon,
  Music2,
  VolumeX,
  Volume1,
  Volume2 as VolumeMax,
  Wand2,
  MousePointerClick,
  Palette,
} from "lucide-react";

// 드래그 앤 드롭
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// 🔽 EditableTimelineClip 컴포넌트를 파일 상단으로 이동 (AssetPanel 정의 전)
const EditableTimelineClip = ({
  cut,
  index,
  isSelected,
  onSelect,
  onUpdateDuration,
  onUpdateTransition,
  onRemove,
}) => {
  const [duration, setDuration] = useState(cut.duration);
  const [isEditingDuration, setIsEditingDuration] = useState(false);

  useEffect(() => setDuration(cut.duration), [cut.duration]);

  const handleDurationSave = () => {
    setIsEditingDuration(false);
    const newDuration = parseFloat(duration);
    if (!isNaN(newDuration) && newDuration > 0.1) {
      onUpdateDuration(cut.id, newDuration);
    } else {
      setDuration(cut.duration); // 원복
    }
  };

  return (
    <div
      className={`p-2 rounded-md shadow border flex flex-col cursor-pointer h-full justify-between
                  ${
                    isSelected
                      ? "bg-blue-100 border-blue-500 ring-2 ring-blue-500"
                      : "bg-white border-slate-200 hover:shadow-md"
                  }`}
      style={{ minWidth: `${Math.max(cut.duration * 30, 100)}px` }}
      onClick={() => onSelect(cut)}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-slate-600 truncate flex-1">
          #{index + 1}: {cut.title || "타이틀 없음"}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(cut.id);
          }}
          className="p-0.5 text-red-400 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="w-full h-10 bg-slate-100 rounded overflow-hidden mb-1.5">
        {cut.imageUrl && (
          <img
            src={cut.imageUrl}
            alt={cut.title || `컷 ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
        {cut.motionVideoUrl && (
          <video
            src={cut.motionVideoUrl}
            className="w-full h-full object-cover bg-black"
            muted
            loop
            playsInline
          />
        )}
        {!cut.imageUrl && !cut.motionVideoUrl && (
          <ImageIcon size={20} className="text-slate-300 m-auto mt-2" />
        )}
      </div>
      <div className="text-xs text-slate-500">
        길이:{" "}
        {isEditingDuration ? (
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onBlur={handleDurationSave}
            autoFocus
            className="w-10 text-xs p-0.5 border-b"
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingDuration(true);
            }}
            className="font-medium hover:underline"
          >
            {cut.duration.toFixed(1)}초
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        전환: {cut.transitionEffect || "없음"}
      </div>
    </div>
  );
};
// 🔼 EditableTimelineClip 정의 끝

// --- 내부 컴포넌트 정의 ---

// 에셋 패널: 원본 스토리 컷 목록, 배경음악 설정
const AssetPanel = ({
  originalStoryCuts,
  onAddCutToSequence,
  backgroundMusic,
  onSetBackgroundMusic,
  onClearBackgroundMusic,
  onSetBGMVolume,
}) => {
  // ... (AssetPanel 코드 내용은 이전과 동일)
  const [bgmUrlInput, setBgmUrlInput] = useState(backgroundMusic?.url || "");

  useEffect(() => {
    setBgmUrlInput(backgroundMusic?.url || "");
  }, [backgroundMusic?.url]);

  const handleBgmUrlApply = () => {
    onSetBackgroundMusic(bgmUrlInput, backgroundMusic?.volume ?? 0.5);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex flex-col h-full overflow-y-auto">
      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-2 flex items-center">
          <ListChecks size={18} className="mr-2 text-indigo-500" /> 원본 컷
          라이브러리
        </h3>
        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {originalStoryCuts && originalStoryCuts.length > 0 ? (
            originalStoryCuts.map((cut) => (
              <div
                key={cut.id || cut.text?.substring(0, 10)}
                className="p-2 border rounded-lg hover:bg-slate-100 shadow-sm cursor-pointer group"
                onClick={() => onAddCutToSequence(cut)}
                title={`"${cut.title || "제목 없음"}" 컷을 타임라인에 추가`}
              >
                <p className="text-xs font-medium text-slate-600 truncate">
                  {cut.title || `컷 내용: ${cut.text?.substring(0, 25)}...`}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                  {cut.imageUrl && <ImageIcon size={12} title="이미지 있음" />}
                  {cut.motionVideoUrl && (
                    <MotionIcon size={12} title="모션 비디오 있음" />
                  )}
                  {cut.ttsAudioUrl && (
                    <TTSIcon size={12} title="TTS 오디오 있음" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-3">
              원본 스토리에 컷이 없습니다.
            </p>
          )}
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-200">
        <h3 className="text-base font-semibold text-slate-700 mb-2 flex items-center">
          <Music2 size={18} className="mr-2 text-green-500" /> 배경 음악
        </h3>
        <input
          type="text"
          placeholder="배경음악 URL (예: .mp3)"
          value={bgmUrlInput}
          onChange={(e) => setBgmUrlInput(e.target.value)}
          onBlur={handleBgmUrlApply}
          className="w-full text-xs p-2 border-slate-300 rounded-md shadow-sm mb-2"
        />
        {backgroundMusic?.url && (
          <audio
            src={backgroundMusic.url}
            controls
            className="w-full h-9 mb-2"
          ></audio>
        )}
        <label className="text-xs flex items-center text-slate-600">
          볼륨:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={backgroundMusic?.volume ?? 0.5}
            onChange={(e) => onSetBGMVolume(parseFloat(e.target.value))}
            className="w-full ml-2 h-1.5 accent-green-500"
          />
        </label>
        {backgroundMusic?.url && (
          <button
            onClick={onClearBackgroundMusic}
            className="text-xs text-red-500 hover:underline mt-1.5 flex items-center"
          >
            <VolumeX size={12} className="mr-1" />
            배경음악 제거
          </button>
        )}
      </div>
    </div>
  );
};

// ... (PreviewPlayer, PropertyInspector, TimelineEditor, EditView 코드 내용은 이전과 동일)
// PreviewPlayer 정의
const PreviewPlayer = ({
  sequence,
  totalDuration,
  backgroundMusic,
  outputSettings,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const currentCutIndex = useRef(0);
  const cutTimerRef = useRef(null);
  const playerRef = useRef(null);

  const currentDisplayAsset = sequence[currentCutIndex.current];

  const playSequence = () => {
    if (sequence.length === 0) return;
    setIsPlaying(true);
    currentCutIndex.current = 0;
    setCurrentTime(0);

    const advanceCut = () => {
      if (currentCutIndex.current < sequence.length - 1) {
        setCurrentTime(
          (prev) => prev + (sequence[currentCutIndex.current]?.duration || 0)
        );
        currentCutIndex.current++;
        clearTimeout(cutTimerRef.current);
        cutTimerRef.current = setTimeout(
          advanceCut,
          (sequence[currentCutIndex.current]?.duration || 3) * 1000
        );
      } else {
        stopSequence();
      }
    };
    cutTimerRef.current = setTimeout(
      advanceCut,
      (sequence[0]?.duration || 3) * 1000
    );
  };

  const stopSequence = () => {
    setIsPlaying(false);
    clearTimeout(cutTimerRef.current);
  };

  const handlePlayPause = () => {
    if (isPlaying) stopSequence();
    else playSequence();
  };

  useEffect(() => {
    stopSequence();
    currentCutIndex.current = 0;
    setCurrentTime(0);
  }, [sequence]);

  return (
    <div className="bg-black rounded-xl shadow-lg flex flex-col items-center justify-center relative aspect-video overflow-hidden border-2 border-slate-700">
      {sequence.length === 0 && <Film size={64} className="text-slate-600" />}
      {currentDisplayAsset && (
        <>
          {currentDisplayAsset.assetType === "image" &&
            currentDisplayAsset.imageUrl && (
              <img
                src={currentDisplayAsset.imageUrl}
                alt={
                  currentDisplayAsset.title ||
                  `컷 ${currentCutIndex.current + 1}`
                }
                className="max-w-full max-h-full object-contain transition-opacity duration-300"
              />
            )}
          {currentDisplayAsset.assetType === "motion" &&
            currentDisplayAsset.motionVideoUrl && (
              <video
                src={currentDisplayAsset.motionVideoUrl}
                className="max-w-full max-h-full object-contain bg-black"
                autoPlay={isPlaying}
                muted
                loop
                playsInline
              />
            )}

          {isPlaying && currentDisplayAsset.textPreview && (
            <div className="absolute bottom-5 left-5 right-5 p-2 bg-black/60 text-white text-sm rounded text-center pointer-events-none">
              {currentDisplayAsset.textPreview}
            </div>
          )}
        </>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between">
        <button
          onClick={handlePlayPause}
          className="p-2 text-white rounded-full hover:bg-white/20"
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <div className="text-xs text-white">
          {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </div>
        <button
          onClick={() => alert("전체화면 (구현 예정)")}
          className="p-2 text-white rounded-full hover:bg-white/20"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
};

// PropertyInspector 정의
const PropertyInspector = ({
  selectedCut,
  onUpdateCut,
  outputSettings,
  onUpdateOutputSetting,
}) => {
  if (!selectedCut && !outputSettings)
    return (
      <div className="text-sm text-slate-400 p-4">
        타임라인에서 컷을 선택하거나 전체 비디오 설정을 편집하세요.
      </div>
    );

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 h-full overflow-y-auto text-xs">
      {selectedCut && (
        <>
          <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-3">
            컷 편집:{" "}
            <span className="font-normal truncate">{selectedCut.title}</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">
                길이 (초):
              </label>
              <input
                type="number"
                value={selectedCut.duration}
                min="0.1"
                step="0.1"
                onChange={(e) =>
                  onUpdateCut(selectedCut.id, {
                    duration: parseFloat(e.target.value) || 0.1,
                  })
                }
                className="w-full p-1.5 border-slate-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">
                다음 컷 전환 효과:
              </label>
              <select
                value={selectedCut.transitionToNext}
                onChange={(e) =>
                  onUpdateCut(selectedCut.id, {
                    transitionToNext: e.target.value,
                  })
                }
                className="w-full p-1.5 border-slate-300 rounded-md shadow-sm bg-white"
              >
                <option value="none">없음</option>
                <option value="fade">페이드</option>
                <option value="slide_left">슬라이드 (왼쪽)</option>
                <option value="slide_right">슬라이드 (오른쪽)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">
                에셋 타입:
              </label>
              <select
                value={selectedCut.assetType}
                onChange={(e) =>
                  onUpdateCut(selectedCut.id, { assetType: e.target.value })
                }
                className="w-full p-1.5 border-slate-300 rounded-md shadow-sm bg-white"
              >
                <option value="image">정적 이미지</option>
                <option value="motion">모션 비디오</option>
                <option value="none">에셋 없음</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div
        className={`pt-3 ${
          selectedCut ? "mt-4 border-t border-slate-200" : ""
        }`}
      >
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          전체 비디오 출력 설정
        </h3>
        <div className="space-y-2">
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">
              해상도:
            </label>
            <select
              value={outputSettings.resolution}
              onChange={(e) =>
                onUpdateOutputSetting("resolution", e.target.value)
              }
              className="w-full p-1.5 border-slate-300 rounded-md shadow-sm bg-white"
            >
              <option value="1080p">1080p (1920x1080)</option>
              <option value="720p">720p (1280x720)</option>
              <option value="SD">SD (640x480)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">
              FPS:
            </label>
            <select
              value={outputSettings.fps}
              onChange={(e) =>
                onUpdateOutputSetting("fps", parseInt(e.target.value))
              }
              className="w-full p-1.5 border-slate-300 rounded-md shadow-sm bg-white"
            >
              <option value={24}>24</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// TimelineEditor 정의
const TimelineEditor = ({
  sequence,
  onSelectCut,
  onUpdateDuration,
  onRemoveCut,
  onReorder,
  selectedCutId,
}) => {
  return (
    <Droppable droppableId="timelineEditor" direction="horizontal">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`bg-slate-100 p-3 rounded-xl shadow-inner h-48 flex items-stretch gap-1.5 overflow-x-auto whitespace-nowrap border border-slate-300
                      ${snapshot.isDraggingOver ? "bg-blue-50" : ""}`}
        >
          {sequence.length > 0 ? (
            sequence.map((cut, index) => (
              <Draggable key={cut.id} draggableId={cut.id} index={index}>
                {(providedDraggable, snapshotDraggable) => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    style={{
                      ...providedDraggable.draggableProps.style,
                      userSelect: "none",
                      height: "100%",
                    }}
                    className={`${
                      snapshotDraggable.isDragging
                        ? "shadow-2xl scale-105 z-10"
                        : "z-0"
                    }`}
                  >
                    <EditableTimelineClip // 이제 여기서 참조 가능
                      cut={cut}
                      index={index}
                      isSelected={selectedCutId === cut.id}
                      onSelect={() => onSelectCut(cut)} // 변경: onSelectCut(cut)으로 호출
                      onUpdateDuration={onUpdateDuration}
                      onRemove={onRemoveCut}
                    />
                  </div>
                )}
              </Draggable>
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <ListChecks size={36} className="mb-1" />
              <p className="text-sm">
                왼쪽 라이브러리에서 컷을 추가하여 비디오를 만드세요.
              </p>
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

// 메인 EditView 컴포넌트
export default function EditView() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();
  const currentEditDocId = storyIdFromUrl || projectIdFromUrl;

  const { settings: globalSettings } = useSettingStore();
  const { story: originalStory, fetchStory: fetchOriginalStory } =
    useStoryStore();

  const {
    editSessionId,
    editSequence,
    backgroundMusic,
    outputSettings,
    isRenderingVideoFile,
    lastRenderedVideoUrl,
    isLoading: isEditStoreLoading,
    isSaving: isEditStoreSaving,
    error: editStoreError,
    initializeEditSession,
    saveEditSession,
    setSequence: setStoreSequence,
    updateCutProperties,
    addCutToSequence: addCutToStoreSequence,
    removeCutFromSequence: removeCutFromStoreSequence,
    reorderSequence: reorderStoreSequence,
    setBackgroundMusic: setStoreBackgroundMusic,
    clearBackgroundMusic: clearStoreBackgroundMusic,
    setBackgroundMusicVolume: setStoreBGMVolume,
    updateOutputSetting: updateStoreOutputSetting,
    requestFinalVideoRender,
  } = useEditStore();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [selectedTimelineCut, setSelectedTimelineCut] = useState(null); // 이 상태가 PropertyInspector에 전달됨

  const totalDuration = editSequence.reduce(
    (sum, cut) => sum + (cut.duration || 0),
    0
  );

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      if (currentEditDocId) {
        await fetchOriginalStory(currentEditDocId, projectIdFromUrl);
      } else {
        setStatusMessage({ type: "error", message: "프로젝트 ID가 없습니다." });
        setIsPageLoading(false);
      }
    };
    loadData();
  }, [currentEditDocId, projectIdFromUrl, fetchOriginalStory]);

  useEffect(() => {
    if (currentEditDocId && originalStory) {
      initializeEditSession(
        currentEditDocId,
        originalStory.cutscenes || [],
        globalSettings.video
      ).finally(() => setIsPageLoading(false));
    } else if (!currentEditDocId) {
      setIsPageLoading(false);
    }
  }, [
    currentEditDocId,
    originalStory,
    initializeEditSession,
    globalSettings.video,
  ]);

  const handleSave = async () => {
    setStatusMessage({ type: "info", message: "편집 내용 저장 중..." });
    try {
      await saveEditSession();
      setStatusMessage({
        type: "success",
        message: "편집 내용이 저장되었습니다!",
      });
    } catch (e) {
      setStatusMessage({ type: "error", message: `저장 실패: ${e.message}` });
    } finally {
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  const handleRender = async () => {
    setStatusMessage({
      type: "info",
      message: "최종 비디오 렌더링 요청 중...",
    });
    await requestFinalVideoRender();
    if (useEditStore.getState().error) {
      setStatusMessage({
        type: "error",
        message: `렌더링 실패: ${useEditStore.getState().error}`,
      });
    } else if (useEditStore.getState().lastRenderedVideoUrl) {
      setStatusMessage({
        type: "success",
        message: "비디오 렌더링이 요청/완료되었습니다!",
      });
    }
    setTimeout(() => setStatusMessage({ type: "", message: "" }), 4000);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderStoreSequence(result.source.index, result.destination.index);
  };

  if (isPageLoading || isEditStoreLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)]">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <p className="mt-3 text-slate-500">편집 데이터 불러오는 중...</p>
      </div>
    );
  }

  const displayError =
    editStoreError ||
    (statusMessage.type === "error" ? statusMessage.message : null);
  if (displayError && editSequence.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] text-red-600">
        <AlertCircle size={48} />
        <p className="mt-3 text-xl">데이터 로드 오류</p>
        <p className="text-sm">
          {typeof displayError === "string"
            ? displayError
            : JSON.stringify(displayError)}
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 font-sans h-[calc(100vh-var(--header-height,80px)-env(safe-area-inset-bottom))] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-800">
            최종 비디오 편집
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isEditStoreSaving || isRenderingVideoFile}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 shadow hover:shadow-md"
            >
              {isEditStoreSaving ? (
                <Loader2 size={16} className="animate-spin mr-1.5" />
              ) : (
                <Save size={16} className="mr-1.5" />
              )}
              {isEditStoreSaving ? "저장 중..." : "편집 내용 저장"}
            </button>
            <button
              onClick={handleRender}
              disabled={
                isEditStoreSaving ||
                isRenderingVideoFile ||
                editSequence.length === 0
              }
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 shadow hover:shadow-md"
            >
              {isRenderingVideoFile ? (
                <Loader2 size={16} className="animate-spin mr-1.5" />
              ) : (
                <Film size={16} className="mr-1.5" />
              )}
              {isRenderingVideoFile ? "렌더링 중..." : "최종 비디오 렌더링"}
            </button>
          </div>
        </div>

        {statusMessage.message && !editStoreError && (
          <div
            className={`flex items-center p-3 rounded-lg mb-3 shadow text-sm font-medium
                ${
                  statusMessage.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : ""
                }
                ${
                  statusMessage.type === "error"
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : ""
                }
                ${
                  statusMessage.type === "info"
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : ""
                }`}
          >
            {statusMessage.type === "success" && (
              <CheckCircle size={18} className="mr-2 flex-shrink-0" />
            )}
            {statusMessage.type === "error" && (
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            )}
            {statusMessage.type === "info" && (
              <Loader2 size={18} className="animate-spin mr-2 flex-shrink-0" />
            )}
            {statusMessage.message}
          </div>
        )}
        {editStoreError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-3 text-sm">
            오류: {editStoreError}
          </div>
        )}
        {isRenderingVideoFile && (
          <div className="bg-indigo-50 text-indigo-700 p-3 rounded-md mb-3 text-sm flex items-center">
            <Loader2 className="animate-spin mr-2" />
            비디오를 생성 중입니다... 이 작업은 시간이 걸릴 수 있습니다.
          </div>
        )}
        {lastRenderedVideoUrl && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-3 text-sm">
            마지막 렌더링 비디오:{" "}
            <a
              href={lastRenderedVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-800 font-medium"
            >
              다운로드/보기
            </a>
          </div>
        )}

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-[400px]">
          <div className="lg:col-span-3 min-h-[200px] lg:min-h-0">
            <AssetPanel
              originalStoryCuts={originalStory?.cutscenes || []}
              onAddCutToSequence={addCutToStoreSequence}
              backgroundMusic={backgroundMusic}
              onSetBackgroundMusic={setStoreBackgroundMusic}
              onClearBackgroundMusic={clearStoreBackgroundMusic}
              onSetBGMVolume={setStoreBGMVolume}
            />
          </div>
          <div className="lg:col-span-5 min-h-[250px] lg:min-h-0">
            <PreviewPlayer
              sequence={editSequence}
              totalDuration={totalDuration}
              backgroundMusic={backgroundMusic}
              // outputSettings={outputSettings} // PreviewPlayer에는 outputSettings 직접 필요 없을 수 있음
            />
          </div>
          <div className="lg:col-span-4 min-h-[200px] lg:min-h-0">
            <PropertyInspector
              selectedCut={selectedTimelineCut} // 이 상태를 사용
              onUpdateCut={updateCutProperties} // 스토어 액션 직접 전달
              outputSettings={outputSettings}
              onUpdateOutputSetting={updateStoreOutputSetting} // 스토어 액션 직접 전달
            />
          </div>
        </div>

        <div className="mt-4 flex-shrink-0">
          <TimelineEditor
            sequence={editSequence}
            onSelectCut={setSelectedTimelineCut} // 로컬 상태를 업데이트하는 함수 전달
            onUpdateDuration={(cutId, duration) =>
              updateCutProperties(cutId, { duration })
            } // 스토어 액션 직접 전달
            onRemoveCut={removeCutFromStoreSequence} // 스토어 액션 직접 전달
            // onReorder는 DragDropContext의 onDragEnd에서 reorderStoreSequence를 호출하므로 직접 전달 안 함
            selectedCutId={selectedTimelineCut?.id}
          />
        </div>
      </div>
    </DragDropContext>
  );
}
