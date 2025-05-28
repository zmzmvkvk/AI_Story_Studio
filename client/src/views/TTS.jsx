// src/views/TTS.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { useStoryStore } from "../store/useStoryStore";
import { useTTSStore } from "../store/useTTSStore"; // TTS 스토어 임포트

import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Sparkles,
  Wand2,
  MicOff,
  MicVocal,
  Play,
  Pause,
  Volume2,
  RefreshCw,
  Trash2,
  Settings2,
  AudioWaveform,
} from "lucide-react";

// 개별 컷 및 TTS 관리 카드
const TTSCutCard = ({
  cut,
  index,
  ttsTrack, // 해당 컷에 대한 TTS 정보 from useTTSStore
  aiMode,
  defaultTTSSettings,
  onGenerateTTS, // (cutId, text, settings) => Promise<audioUrl>
  onRemoveTTS, // (cutId) => void
  onPlayTTS, // (audioUrl) => void
  onPauseTTS, // () => void
  currentlyPlaying, // audioUrl or null
  isProcessingSpecific, // boolean
}) => {
  const audioRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(
    ttsTrack?.speaker || defaultTTSSettings.speaker
  );
  const [currentSpeed, setCurrentSpeed] = useState(
    ttsTrack?.speed || defaultTTSSettings.speed
  );

  useEffect(() => {
    if (ttsTrack) {
      setCurrentSpeaker(ttsTrack.speaker || defaultTTSSettings.speaker);
      setCurrentSpeed(ttsTrack.speed || defaultTTSSettings.speed);
    } else {
      setCurrentSpeaker(defaultTTSSettings.speaker);
      setCurrentSpeed(defaultTTSSettings.speed);
    }
  }, [ttsTrack, defaultTTSSettings]);

  useEffect(() => {
    if (audioRef.current && ttsTrack?.audioUrl) {
      if (currentlyPlaying === ttsTrack.audioUrl) {
        // audioRef.current.play(); // 자동 재생은 UX상 좋지 않을 수 있음
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentlyPlaying, ttsTrack?.audioUrl]);

  const handlePlayPause = () => {
    if (ttsTrack?.audioUrl) {
      if (
        currentlyPlaying === ttsTrack.audioUrl &&
        audioRef.current &&
        !audioRef.current.paused
      ) {
        onPauseTTS();
        audioRef.current.pause();
      } else {
        onPlayTTS(ttsTrack.audioUrl);
        audioRef.current?.play();
      }
    }
  };

  const handleGenerateClick = () => {
    const settingsToUse = { speaker: currentSpeaker, speed: currentSpeed };
    onGenerateTTS(cut.id || `cut-${index}`, cut.text, settingsToUse);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            컷 #{index + 1}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-3" title={cut.text}>
            {cut.text || "내용 없음"}
          </p>
        </div>
        {ttsTrack?.audioUrl && !isProcessingSpecific && (
          <button
            onClick={() => onRemoveTTS(cut.id || `cut-${index}`)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors flex-shrink-0 ml-2"
            title="TTS 삭제"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 mb-4 min-h-[80px] flex items-center justify-center border border-slate-200">
        {isProcessingSpecific ? (
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        ) : ttsTrack?.audioUrl ? (
          <div className="w-full flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title={
                currentlyPlaying === ttsTrack.audioUrl &&
                audioRef.current &&
                !audioRef.current.paused
                  ? "일시정지"
                  : "재생"
              }
            >
              {currentlyPlaying === ttsTrack.audioUrl &&
              audioRef.current &&
              !audioRef.current.paused ? (
                <Pause size={20} />
              ) : (
                <Play size={20} />
              )}
            </button>
            <div className="text-sm text-slate-600">
              <p>
                음성: {ttsTrack.speaker}, 속도: {ttsTrack.speed}x
              </p>
              <audio
                ref={audioRef}
                src={ttsTrack.audioUrl}
                onEnded={onPauseTTS}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <MicOff size={32} className="mx-auto mb-1" />
            <p className="text-sm">TTS 생성 필요</p>
          </div>
        )}
      </div>

      {/* TTS 설정 (AI 모드가 아니거나, AI 모드여도 미세조정 허용 시) */}
      {(!aiMode ||
        (aiMode &&
          ttsTrack?.audioUrl)) /* AI모드일 때는 생성된 후 미세조정 가능하도록 */ && (
        <div className="mb-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs text-blue-600 hover:underline mb-2 flex items-center"
          >
            <Settings2 size={14} className="mr-1" /> 목소리/속도{" "}
            {ttsTrack?.audioUrl ? "미세 조정" : "설정"}
          </button>
          {showSettings && (
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-3 text-sm">
              <div>
                <label
                  htmlFor={`speaker-${index}`}
                  className="block text-xs font-medium text-slate-600 mb-0.5"
                >
                  목소리
                </label>
                <select
                  id={`speaker-${index}`}
                  value={currentSpeaker}
                  onChange={(e) => setCurrentSpeaker(e.target.value)}
                  className="w-full p-1.5 border-slate-300 rounded-md text-xs"
                >
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                  {/* 다른 목소리 옵션 */}
                </select>
              </div>
              <div>
                <label
                  htmlFor={`speed-${index}`}
                  className="block text-xs font-medium text-slate-600 mb-0.5"
                >
                  속도 ({currentSpeed}x)
                </label>
                <input
                  type="range"
                  id={`speed-${index}`}
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={currentSpeed}
                  onChange={(e) => setCurrentSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleGenerateClick}
        disabled={isProcessingSpecific || !cut.text}
        className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors focus:outline-none focus:ring-2 disabled:opacity-60
          ${
            aiMode && !ttsTrack?.audioUrl
              ? "bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400"
              : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400"
          }
        `}
      >
        {isProcessingSpecific ? (
          <Loader2 size={18} className="animate-spin mr-2" />
        ) : ttsTrack?.audioUrl ? (
          <RefreshCw size={16} className="mr-2" />
        ) : (
          <MicVocal size={16} className="mr-2" />
        )}
        {isProcessingSpecific
          ? "생성 중..."
          : ttsTrack?.audioUrl
          ? "TTS 다시 생성"
          : "TTS 생성"}
      </button>
    </div>
  );
};

export default function TTSView() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();
  const currentDocId = storyIdFromUrl || projectIdFromUrl; // Firestore 문서 ID로 사용

  const { aiMode, settings: projectSettings } = useSettingStore();
  const { story: loadedStory, fetchStory } = useStoryStore();
  const {
    tracks,
    fetchTracks,
    saveTracks,
    addTrack,
    updateTrack,
    removeTrack,
  } = useTTSStore(); //

  const [localCuts, setLocalCuts] = useState([]);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [processingCutId, setProcessingCutId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

  // 스토리 및 TTS 트랙 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsComponentLoading(true);
      if (currentDocId) {
        await fetchStory(currentDocId, projectIdFromUrl); // 스토리(컷 텍스트) 로드
        await fetchTracks(currentDocId); // 저장된 TTS 트랙 로드
      }
      setIsComponentLoading(false);
    };
    loadData();
  }, [currentDocId, projectIdFromUrl, fetchStory, fetchTracks]); //

  useEffect(() => {
    if (loadedStory?.cutscenes) {
      setLocalCuts(
        loadedStory.cutscenes.map((cut, index) => ({
          ...cut,
          id: cut.id || `cut-${index}`,
        }))
      );
    } else {
      setLocalCuts([]);
    }
  }, [loadedStory]);

  // 개별 컷 TTS 생성
  const handleGenerateTTSForCut = useCallback(
    async (cutId, cutText, ttsSettings) => {
      setProcessingCutId(cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${
          localCuts.findIndex((c) => c.id === cutId) + 1
        } TTS 생성 중...`,
      });
      try {
        // TODO: 실제 TTS 생성 API 호출
        // const { audioUrl, actualSpeaker, actualSpeed } = await callTTSAPI(cutText, ttsSettings);
        await new Promise((resolve) => setTimeout(resolve, 1200)); // API 시뮬레이션
        const audioUrl = `/audio-placeholder/tts-${cutId}-${Date.now()}.mp3`; // 가상 URL

        const newTrack = {
          id: cutId, // 컷 ID와 동일하게 사용하거나 별도 생성
          cutId: cutId,
          audioUrl,
          text: cutText, // 원본 텍스트도 저장 (선택 사항)
          speaker: ttsSettings.speaker,
          speed: ttsSettings.speed,
          createdAt: Date.now(),
        };

        const existingTrackIndex = tracks.findIndex((t) => t.cutId === cutId);
        if (existingTrackIndex > -1) {
          updateTrack(tracks[existingTrackIndex].id, newTrack); // 기존 트랙 ID로 업데이트
        } else {
          addTrack({ ...newTrack, id: `${cutId}-tts-${Date.now()}` }); // 새 트랙으로 추가 (고유 ID 생성)
        }
        setStatusMessage({ type: "success", message: `컷 TTS 생성 완료!` });
      } catch (error) {
        console.error("Error generating TTS for cut:", cutId, error);
        setStatusMessage({ type: "error", message: "TTS 생성 실패." });
      } finally {
        setProcessingCutId(null);
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [localCuts, tracks, addTrack, updateTrack]
  ); //

  const handleRemoveTTSForCut = useCallback(
    (cutId) => {
      const trackToRemove = tracks.find((t) => t.cutId === cutId);
      if (trackToRemove) {
        removeTrack(trackToRemove.id); //
      }
      setStatusMessage({ type: "info", message: `컷 TTS가 제거되었습니다.` });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    },
    [tracks, removeTrack]
  ); //

  const handlePlayTTS = (audioUrl) => {
    setCurrentlyPlayingAudio(audioUrl);
  };
  const handlePauseTTS = () => {
    setCurrentlyPlayingAudio(null);
  };

  // 모든 컷에 대해 TTS 일괄 생성
  const handleBatchGenerateTTS = async () => {
    setIsBatchProcessing(true);
    setStatusMessage({
      type: "info",
      message: "모든 컷에 대해 TTS 일괄 생성 중...",
    });
    let successCount = 0;
    try {
      for (const cut of localCuts) {
        const existingTrack = tracks.find((t) => t.cutId === cut.id);
        if (!existingTrack && cut.text) {
          // TTS가 없고 텍스트가 있는 컷에 대해서만
          setProcessingCutId(cut.id);
          await handleGenerateTTSForCut(cut.id, cut.text, projectSettings.tts); // 스토어의 함수 직접 호출
          successCount++;
        }
      }
      setStatusMessage({
        type: "success",
        message: `${successCount}개의 TTS 일괄 생성 완료!`,
      });
    } catch (error) {
      console.error("Error batch generating TTS:", error);
      setStatusMessage({ type: "error", message: "일부 TTS 생성 실패." });
    } finally {
      setIsBatchProcessing(false);
      setProcessingCutId(null);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  // 변경사항 저장
  const handleSaveChanges = async () => {
    setIsBatchProcessing(true);
    setStatusMessage({ type: "info", message: "TTS 정보 저장 중..." });
    try {
      await saveTracks(currentDocId); // useTTSStore의 saveTracks 호출
      setStatusMessage({
        type: "success",
        message: "TTS 정보가 성공적으로 저장되었습니다!",
      });
    } catch (error) {
      console.error("Error saving TTS tracks:", error);
      setStatusMessage({ type: "error", message: "TTS 정보 저장 실패." });
    } finally {
      setIsBatchProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  if (isComponentLoading) {
    return (
      /* 로딩 UI ... */
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-blue-600">
        <Loader2 size={48} className="animate-spin" />
        <span className="ml-3 text-xl mt-4">음성 데이터 불러오는 중...</span>
      </div>
    );
  }

  const defaultTTSSettingsFromStore = projectSettings?.tts || {
    speaker: "female",
    speed: 1.0,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
          음성(TTS) 생성 및 편집
          <span className="text-2xl font-semibold text-slate-500 ml-2">
            ({aiMode ? "AI 모드" : "수동 설정"})
          </span>
        </h1>
        <div className="flex gap-3">
          {/* AI 모드일 경우에도 일괄 생성 기능 제공 가능 */}
          <button
            onClick={handleBatchGenerateTTS}
            disabled={
              isBatchProcessing ||
              localCuts.every((c) => tracks.find((t) => t.cutId === c.id))
            }
            className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60"
          >
            {isBatchProcessing ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Wand2 size={16} className="mr-2" />
            )}
            {isBatchProcessing ? "일괄 생성 중..." : "TTS 일괄 생성"}
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isBatchProcessing || tracks.length === 0} // 저장할 트랙이 없으면 비활성화
            className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          >
            {isBatchProcessing && !processingCutId ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {isBatchProcessing && !processingCutId
              ? "저장 중..."
              : "변경사항 저장"}
          </button>
        </div>
      </div>

      {statusMessage.message /* 상태 메시지 바 ... */ && (
        <div
          className={`flex items-center p-3.5 rounded-lg mb-6 shadow text-sm font-medium
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

      {localCuts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localCuts.map((cut, index) => {
            const ttsTrackForCut = tracks.find(
              (t) => t.cutId === (cut.id || `cut-${index}`)
            ); //
            return (
              <TTSCutCard
                key={cut.id || `cut-${index}`}
                cut={cut}
                index={index}
                ttsTrack={ttsTrackForCut}
                aiMode={aiMode}
                defaultTTSSettings={defaultTTSSettingsFromStore}
                onGenerateTTS={handleGenerateTTSForCut}
                onRemoveTTS={handleRemoveTTSForCut}
                onPlayTTS={handlePlayTTS}
                onPauseTTS={handlePauseTTS}
                currentlyPlaying={currentlyPlayingAudio}
                isProcessingSpecific={
                  processingCutId === (cut.id || `cut-${index}`)
                }
              />
            );
          })}
        </div>
      ) : (
        /* 컷 없음 안내 UI ... */
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <AudioWaveform size={56} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl text-slate-500 mb-2">
            스토리 뷰에서 먼저 컷을 작성해주세요.
          </p>
          <p className="text-sm text-slate-400">
            컷이 있어야 해당 컷의 텍스트로 음성(TTS)을 생성할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
