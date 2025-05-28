// src/views/Video.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { useStoryStore } from "../store/useStoryStore";
import { useVideoStore } from "../store/useVideoStore"; // 비디오 스토어 (모션 클립 정보 관리)

import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Film,
  RefreshCw,
  Play,
  Wand2,
  Image as ImageIcon,
  Trash2,
  SlidersHorizontal,
  ImagePlay,
} from "lucide-react";

// 각 컷에 대한 모션 생성 카드
const MotionCutCard = ({
  cut, // 스토리 컷 정보 (id, text, imageUrl 등)
  index,
  motionClip, // 해당 컷에 대한 모션 비디오 정보 from useVideoStore
  onGenerateMotion, // (cutId, imageUrl, motionParams) => Promise<motionVideoUrl>
  onRemoveMotion, // (cutId) => void
  isProcessingSpecific, // boolean
}) => {
  const [selectedMotionType, setSelectedMotionType] = useState(
    motionClip?.motionType || "pan"
  ); // 예시 모션 타입
  const videoRef = useRef(null);

  // Leonardo AI가 지원하는 모션 타입 예시 (실제 API 문서 참고 필요)
  const motionTypes = [
    { id: "pan", name: "패닝 (Pan)" },
    { id: "zoom_in", name: "줌인 (Zoom In)" },
    { id: "zoom_out", name: "줌아웃 (Zoom Out)" },
    { id: "orbit_left", name: "궤도 (왼쪽)" },
    { id: "tilt_up", name: "틸트 (위로)" },
  ];

  const handleGenerateClick = () => {
    if (!cut.imageUrl) {
      alert(
        "원본 이미지가 없습니다. 이미지 뷰에서 먼저 이미지를 준비해주세요."
      );
      return;
    }
    onGenerateMotion(cut.id, cut.imageUrl, { motionType: selectedMotionType });
  };

  // 모션 비디오 URL이 변경되면 비디오 다시 로드 (autoplay는 사용하지 않음)
  useEffect(() => {
    if (videoRef.current && motionClip?.motionVideoUrl) {
      videoRef.current.load();
    }
  }, [motionClip?.motionVideoUrl]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row gap-4">
      {/* 원본 이미지 */}
      <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
        {cut.imageUrl ? (
          <img
            src={cut.imageUrl}
            alt={`원본 이미지 ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <ImageIcon size={32} />
            <span className="text-xs mt-1">이미지 없음</span>
          </div>
        )}
      </div>

      {/* 모션 비디오 및 컨트롤 */}
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="flex justify-between items-center mb-1.5">
          <h3 className="text-base font-semibold text-slate-700">
            컷 #{index + 1} 모션
          </h3>
          {motionClip?.motionVideoUrl && !isProcessingSpecific && (
            <button
              onClick={() => onRemoveMotion(cut.id)}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
              title="모션 비디오 삭제"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <p
          className="text-xs text-slate-500 mb-2 line-clamp-2 h-8"
          title={cut.text}
        >
          {cut.text || "내용 없음"}
        </p>

        <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center mb-3 overflow-hidden border border-slate-200">
          {isProcessingSpecific ? (
            <Loader2 size={32} className="text-blue-500 animate-spin" />
          ) : motionClip?.motionVideoUrl ? (
            <video
              ref={videoRef}
              src={motionClip.motionVideoUrl}
              controls
              loop
              muted
              className="w-full h-full object-contain bg-black"
            ></video>
          ) : (
            <div className="text-center text-slate-400 p-2">
              <ImagePlay size={36} className="mx-auto mb-1" />
              <p className="text-sm">모션 생성 필요</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="w-full sm:w-1/2">
            <label htmlFor={`motion-type-${index}`} className="sr-only">
              모션 타입
            </label>
            <select
              id={`motion-type-${index}`}
              value={selectedMotionType}
              onChange={(e) => setSelectedMotionType(e.target.value)}
              disabled={isProcessingSpecific || !cut.imageUrl}
              className="w-full px-3 py-2 text-xs border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
            >
              {motionTypes.map((mt) => (
                <option key={mt.id} value={mt.id}>
                  {mt.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateClick}
            disabled={isProcessingSpecific || !cut.imageUrl || !cut.text}
            className="w-full sm:w-1/2 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60"
          >
            {isProcessingSpecific ? (
              <Loader2 size={16} className="animate-spin mr-1.5" />
            ) : motionClip?.motionVideoUrl ? (
              <RefreshCw size={14} className="mr-1.5" />
            ) : (
              <Wand2 size={14} className="mr-1.5" />
            )}
            {isProcessingSpecific
              ? "생성 중..."
              : motionClip?.motionVideoUrl
              ? "다시 생성"
              : "모션 생성"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function VideoView() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();
  const currentDocId = storyIdFromUrl || projectIdFromUrl; // Firestore 문서 ID

  // const { aiMode } = useSettingStore(); // 필요시 AI 모드 참조
  const { story: loadedStory, fetchStory } = useStoryStore();
  // useVideoStore는 이제 컷별 모션 클립 정보를 저장한다고 가정.
  // video.motionClips: [{ cutId, originalImageUrl, motionVideoUrl, motionType, ... }]
  const {
    video: loadedVideoMeta,
    fetchVideo,
    updateVideo,
    saveVideo,
  } = useVideoStore();

  const [storyCuts, setStoryCuts] = useState([]); // 원본 스토리 컷 목록 (id, text, imageUrl 포함)
  const [motionClips, setMotionClips] = useState([]); // 로컬에서 관리하는 모션 클립 정보 배열

  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [processingCutId, setProcessingCutId] = useState(null); // 개별 컷 처리 중 ID
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  // 데이터 로드: 스토리 (컷, 이미지 URL 등) 및 저장된 비디오/모션 정보
  useEffect(() => {
    const loadData = async () => {
      setIsComponentLoading(true);
      if (currentDocId) {
        await fetchStory(currentDocId, projectIdFromUrl); // 스토리 로드
        await fetchVideo(currentDocId); // 저장된 모션 클립 정보 로드 (docId = currentDocId)
      }
      setIsComponentLoading(false);
    };
    loadData();
  }, [currentDocId, projectIdFromUrl, fetchStory, fetchVideo]);

  // 로드된 스토리 컷과 모션 클립 정보를 로컬 상태에 반영/병합
  useEffect(() => {
    if (loadedStory?.cutscenes) {
      const cuts = loadedStory.cutscenes.map((cut, index) => ({
        ...cut,
        id: cut.id || `cut-${index}`,
      }));
      setStoryCuts(cuts);

      if (loadedVideoMeta?.motionClips) {
        setMotionClips(loadedVideoMeta.motionClips);
      } else {
        // 저장된 모션 클립 정보가 없으면, 각 스토리 컷에 대해 빈 모션 클립 구조 초기화 (선택적)
        // setMotionClips(cuts.map(c => ({ cutId: c.id, originalImageUrl: c.imageUrl, motionVideoUrl: null, motionType: 'pan' })));
        setMotionClips([]); // 또는 그냥 비워둠
      }
    } else {
      setStoryCuts([]);
      setMotionClips([]);
    }
  }, [loadedStory, loadedVideoMeta]);

  // 개별 컷 모션 생성
  const handleGenerateMotionForCut = useCallback(
    async (cutId, imageUrl, motionParams) => {
      setProcessingCutId(cutId);
      const cutIndex = storyCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 모션 생성 중... (${
          motionParams.motionType
        })`,
      });
      try {
        // TODO: 실제 Leonardo AI Img-to-Video API 호출
        // const result = await leonardoAIGenerateMotion(imageUrl, motionParams);
        await new Promise((resolve) => setTimeout(resolve, 2500)); // API 시뮬레이션
        const motionVideoUrl = `https://example.com/motion-${cutId}-${motionParams.motionType}.mp4`; // 가상 URL

        const newClip = {
          cutId,
          originalImageUrl: imageUrl,
          motionVideoUrl,
          motionType: motionParams.motionType,
          createdAt: Date.now(),
        };

        setMotionClips((prevClips) => {
          const existingClipIdx = prevClips.findIndex(
            (mc) => mc.cutId === cutId
          );
          if (existingClipIdx > -1) {
            const updatedClips = [...prevClips];
            updatedClips[existingClipIdx] = {
              ...prevClips[existingClipIdx],
              ...newClip,
            };
            return updatedClips;
          }
          return [...prevClips, newClip];
        });
        setStatusMessage({
          type: "success",
          message: `컷 #${cutIndex + 1} 모션 생성 완료!`,
        });
      } catch (error) {
        console.error("Error generating motion for cut:", cutId, error);
        setStatusMessage({ type: "error", message: "모션 생성 실패." });
      } finally {
        setProcessingCutId(null);
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [storyCuts]
  );

  const handleRemoveMotionForCut = useCallback(
    (cutId) => {
      setMotionClips((prevClips) =>
        prevClips.filter((mc) => mc.cutId !== cutId)
      );
      const cutIndex = storyCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 모션이 제거되었습니다.`,
      });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    },
    [storyCuts]
  );

  // 모든 컷에 대해 모션 일괄 적용
  const handleBatchGenerateMotions = async () => {
    setIsBatchProcessing(true);
    setStatusMessage({
      type: "info",
      message: "모든 이미지에 대해 모션 일괄 적용 중...",
    });
    let successCount = 0;
    const defaultMotionParams = { motionType: "pan" }; // 기본 모션 타입

    try {
      for (const cut of storyCuts) {
        const existingClip = motionClips.find((mc) => mc.cutId === cut.id);
        if (cut.imageUrl && !existingClip?.motionVideoUrl) {
          // 이미지가 있고, 아직 모션이 없는 컷에 대해서만
          setProcessingCutId(cut.id);
          // TODO: 실제 AI 이미지 생성 API 호출
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 각 컷당 API 호출 시뮬레이션
          const motionVideoUrl = `https://example.com/motion-${cut.id}-batch.mp4`;

          const newClip = {
            cutId: cut.id,
            originalImageUrl: cut.imageUrl,
            motionVideoUrl,
            motionType: defaultMotionParams.motionType,
            createdAt: Date.now(),
          };
          setMotionClips((prevClips) => {
            // 상태 업데이트 함수형으로
            const existingIdx = prevClips.findIndex(
              (mc) => mc.cutId === cut.id
            );
            if (existingIdx > -1) {
              const updated = [...prevClips];
              updated[existingIdx] = { ...updated[existingIdx], ...newClip };
              return updated;
            }
            return [...prevClips, newClip];
          });
          successCount++;
        }
      }
      setStatusMessage({
        type: "success",
        message: `${successCount}개의 모션 비디오 일괄 생성 완료!`,
      });
    } catch (error) {
      console.error("Error batch generating motions:", error);
      setStatusMessage({ type: "error", message: "일부 모션 생성 실패." });
    } finally {
      setIsBatchProcessing(false);
      setProcessingCutId(null);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  // 변경사항 저장
  const handleSaveChanges = async () => {
    setIsBatchProcessing(true);
    setStatusMessage({ type: "info", message: "모션 비디오 정보 저장 중..." });
    try {
      // useVideoStore의 video 객체를 업데이트하고 Firestore에 저장
      const videoDataToSave = {
        id: currentDocId, // document ID
        projectId: projectIdFromUrl,
        motionClips: motionClips, // 현재 로컬의 motionClips 배열
        // 기타 비디오 메타데이터 (예: 최종 편집에 사용될 정보)
        updatedAt: new Date(),
      };
      updateVideo(videoDataToSave); // 스토어 상태 업데이트
      await saveVideo(); // 스토어의 현재 video 상태를 저장

      setStatusMessage({
        type: "success",
        message: "모션 비디오 정보가 저장되었습니다!",
      });
    } catch (error) {
      console.error("Error saving motion clips:", error);
      setStatusMessage({ type: "error", message: "모션 정보 저장 실패." });
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
        <span className="ml-3 text-xl mt-4">데이터 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
          이미지 모션 생성{" "}
          <span className="text-xl font-normal text-slate-500">
            (Img-to-Video)
          </span>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleBatchGenerateMotions}
            disabled={
              isBatchProcessing ||
              storyCuts.every((c) =>
                motionClips.find((mc) => mc.cutId === c.id && mc.motionVideoUrl)
              )
            }
            className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60"
          >
            {isBatchProcessing ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Wand2 size={16} className="mr-2" />
            )}
            {isBatchProcessing ? "일괄 적용 중..." : "모든 컷에 모션 적용"}
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isBatchProcessing || motionClips.length === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          >
            {isBatchProcessing && !processingCutId ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {isBatchProcessing && !processingCutId
              ? "저장 중..."
              : "모션 정보 저장"}
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

      {storyCuts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {" "}
          {/* 한 행에 2개씩 표시 */}
          {storyCuts.map((cut, index) => {
            const clip = motionClips.find((mc) => mc.cutId === cut.id);
            return (
              <MotionCutCard
                key={cut.id}
                cut={cut}
                index={index}
                motionClip={clip}
                onGenerateMotion={handleGenerateMotionForCut}
                onRemoveMotion={handleRemoveMotionForCut}
                isProcessingSpecific={processingCutId === cut.id}
              />
            );
          })}
        </div>
      ) : (
        /* 컷 없음 안내 UI ... */
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <ImageIcon size={56} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl text-slate-500 mb-2">
            스토리 및 이미지 뷰에서 먼저 컷과 이미지를 준비해주세요.
          </p>
          <p className="text-sm text-slate-400">
            이미지가 있어야 해당 이미지로 모션 비디오를 생성할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
