// src/views/Image.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore"; // AI 모드 확인용
import { useStoryStore } from "../store/useStoryStore"; // 컷 목록 및 스토리 저장용
// import { useImageStore } from "../store/useImageStore"; // 이미지 개별 관리 시 필요 (현재는 StoryStore에 통합 가정)

import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Sparkles,
  Wand2,
  ImageOff,
  UploadCloud,
  RefreshCw,
  Trash2,
  Link as LinkIcon,
  Replace, // lucide-react 아이콘
} from "lucide-react";

// 개별 컷 및 이미지 관리 카드
const ImageCutCard = ({
  cut,
  index,
  aiMode,
  onGenerateImage,
  onUploadImage,
  onRemoveImage,
  isProcessingSpecific,
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cut.imageUrl || null); // 로컬 미리보기 URL 상태
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImagePreviewUrl(cut.imageUrl || null);
  }, [cut.imageUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // 임시 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // 실제 업로드 로직 호출 (onUploadImage는 상위 컴포넌트에서 파일과 cut.id/index를 받아 처리)
      try {
        await onUploadImage(cut.id || index, file); // cut 객체에 고유 ID가 있다면 사용, 없으면 index
        // 성공 시 onUploadImage 내부에서 cut.imageUrl이 업데이트되고 useEffect에 의해 imagePreviewUrl도 변경될 것임
      } catch (error) {
        console.error("Error uploading image for cut:", cut.id || index, error);
        // 업로드 실패 시 미리보기 제거 또는 이전 상태로 복구
        if (!cut.imageUrl) setImagePreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const inputId = `file-upload-${cut.id || index}`;

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            컷 #{index + 1}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2" title={cut.text}>
            {cut.text || "내용 없음"}
          </p>
        </div>
        {imagePreviewUrl && !isProcessingSpecific && !isUploading && (
          <button
            onClick={() => onRemoveImage(cut.id || index)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors flex-shrink-0 ml-2"
            title="이미지 삭제"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden border border-slate-200">
        {isProcessingSpecific || isUploading ? (
          <Loader2 size={32} className="text-blue-500 animate-spin" />
        ) : imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt={`컷 ${index + 1} 이미지`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-slate-400">
            <ImageOff size={40} className="mx-auto mb-1" />
            <p className="text-sm">이미지 없음</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {aiMode ? (
          <button
            onClick={() => onGenerateImage(cut.id || index, cut.text)}
            disabled={isProcessingSpecific || isUploading}
            className="flex-1 w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
          >
            {isProcessingSpecific ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : imagePreviewUrl ? (
              <RefreshCw size={16} className="mr-2" />
            ) : (
              <Sparkles size={16} className="mr-2" />
            )}
            {isProcessingSpecific
              ? "생성 중..."
              : imagePreviewUrl
              ? "AI 이미지 재생성"
              : "AI 이미지 생성"}
          </button>
        ) : (
          <>
            <input
              type="file"
              id={inputId}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessingSpecific || isUploading}
            />
            <button
              type="button"
              onClick={() => document.getElementById(inputId).click()}
              disabled={isProcessingSpecific || isUploading}
              className="flex-1 w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : imagePreviewUrl ? (
                <Replace size={16} className="mr-2" />
              ) : (
                <UploadCloud size={16} className="mr-2" />
              )}
              {isUploading
                ? "업로드 중..."
                : imagePreviewUrl
                ? "이미지 변경"
                : "이미지 업로드"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default function ImageView() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();
  const currentStoryId = storyIdFromUrl || projectIdFromUrl;

  const { aiMode } = useSettingStore(); // 설정 스토어에서 AI 모드 가져오기
  const { story: loadedStory, fetchStory, saveStoryData } = useStoryStore(); // 스토리 스토어

  const [localCuts, setLocalCuts] = useState([]);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false); // 전체 생성/저장 로딩
  const [processingCutId, setProcessingCutId] = useState(null); // 개별 컷 처리 중 ID
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  // 스토리 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsComponentLoading(true);
      if (currentStoryId) {
        await fetchStory(currentStoryId, projectIdFromUrl);
      }
      setIsComponentLoading(false);
    };
    loadData();
  }, [currentStoryId, projectIdFromUrl, fetchStory]);

  // 로드된 스토리 데이터를 로컬 상태에 반영
  useEffect(() => {
    if (loadedStory?.cutscenes) {
      // 각 컷에 고유 ID가 없다면 여기서 생성 (실제로는 Firestore 저장 시 생성 권장)
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

  // 개별 컷 이미지 생성 (AI 모드)
  const handleGenerateImageForCut = useCallback(
    async (cutId) => {
      // async (cutId, cutText) => {
      setProcessingCutId(cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${
          localCuts.findIndex((c) => (c.id || c.index) === cutId) + 1
        } 이미지 생성 중...`,
      });
      try {
        // TODO: 실제 AI 이미지 생성 API 호출
        // const imageUrl = await callAIImageGenerationAPI(cutText, settings.image.style);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // API 호출 시뮬레이션
        const imageUrl = `https://placehold.co/600x400/${Math.floor(
          Math.random() * 16777215
        ).toString(16)}/ffffff?text=AI+Image+${cutId.toString().slice(-2)}`;

        setLocalCuts((prevCuts) =>
          prevCuts.map((c) =>
            (c.id || c.index) === cutId ? { ...c, imageUrl } : c
          )
        );
        setStatusMessage({
          type: "success",
          message: `컷 #${
            localCuts.findIndex((c) => (c.id || c.index) === cutId) + 1
          } 이미지 생성 완료!`,
        });
      } catch (error) {
        console.error("Error generating AI image for cut:", cutId, error);
        setStatusMessage({ type: "error", message: "이미지 생성 실패." });
      } finally {
        setProcessingCutId(null);
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [localCuts]
  );

  // 개별 컷 이미지 업로드 (수동 모드)
  const handleUploadImageForCut = useCallback(
    async (cutId, file) => {
      setProcessingCutId(cutId); // 개별 로딩 상태
      setStatusMessage({
        type: "info",
        message: `컷 #${
          localCuts.findIndex((c) => (c.id || c.index) === cutId) + 1
        } 이미지 업로드 중...`,
      });
      try {
        // TODO: 실제 파일 업로드 로직 (예: Firebase Storage)
        // const imageUrl = await uploadFileToStorage(file);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 업로드 시뮬레이션
        const imageUrl = URL.createObjectURL(file); // 임시 로컬 URL

        setLocalCuts((prevCuts) =>
          prevCuts.map((c) =>
            (c.id || c.index) === cutId ? { ...c, imageUrl } : c
          )
        );
        setStatusMessage({
          type: "success",
          message: `컷 #${
            localCuts.findIndex((c) => (c.id || c.index) === cutId) + 1
          } 이미지 업로드 완료!`,
        });
        return imageUrl; // 성공 시 URL 반환 (ImageCutCard에서 미리보기 업데이트에 사용 가능)
      } catch (error) {
        console.error("Error uploading image for cut:", cutId, error);
        setStatusMessage({ type: "error", message: "이미지 업로드 실패." });
        throw error; // ImageCutCard에서 에러 처리하도록 전파
      } finally {
        setProcessingCutId(null);
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [localCuts]
  );

  // 개별 컷 이미지 삭제
  const handleRemoveImageForCut = useCallback(
    (cutId) => {
      setLocalCuts((prevCuts) =>
        prevCuts.map((c) =>
          (c.id || c.index) === cutId ? { ...c, imageUrl: null } : c
        )
      );
      setStatusMessage({
        type: "info",
        message: `컷 #${
          localCuts.findIndex((c) => (c.id || c.index) === cutId) + 1
        } 이미지가 제거되었습니다.`,
      });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    },
    [localCuts]
  );

  // 모든 컷에 대해 AI 이미지 일괄 생성
  const handleBatchGenerateImages = async () => {
    setIsBatchProcessing(true);
    setStatusMessage({
      type: "info",
      message: "모든 컷에 대해 AI 이미지 일괄 생성 중...",
    });
    let successCount = 0;
    try {
      for (const cut of localCuts) {
        if (!cut.imageUrl) {
          // 이미지가 없는 컷에 대해서만 생성
          setProcessingCutId(cut.id || cut.index); // 개별 컷 처리 중 시각적 표시
          // TODO: 실제 AI 이미지 생성 API 호출
          await new Promise((resolve) => setTimeout(resolve, 700)); // 각 컷당 API 호출 시뮬레이션
          const imageUrl = `https://placehold.co/600x400/${Math.floor(
            Math.random() * 16777215
          ).toString(16)}/ffffff?text=Batch+AI+${(cut.id || cut.index)
            .toString()
            .slice(-2)}`;
          setLocalCuts((prev) =>
            prev.map((c) =>
              (c.id || c.index) === (cut.id || cut.index)
                ? { ...c, imageUrl }
                : c
            )
          );
          successCount++;
        }
      }
      setStatusMessage({
        type: "success",
        message: `${successCount}개의 이미지 일괄 생성 완료!`,
      });
    } catch (error) {
      console.error("Error batch generating AI images:", error);
      setStatusMessage({ type: "error", message: "일부 이미지 생성 실패." });
    } finally {
      setIsBatchProcessing(false);
      setProcessingCutId(null);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  // 변경사항 저장
  const handleSaveChanges = async () => {
    setIsBatchProcessing(true);
    setStatusMessage({ type: "info", message: "변경사항 저장 중..." });
    try {
      // useStoryStore의 cutscenes를 업데이트하고 Firestore에 저장
      const storyPayload = {
        ...loadedStory, // 기존 스토리 정보 유지
        id: currentStoryId,
        projectId: projectIdFromUrl,
        cutscenes: localCuts, // 업데이트된 컷 (imageUrl 포함)
        // productImageUrl, storyPrompt 등 다른 필드도 필요시 함께 업데이트
      };
      await saveStoryData(storyPayload); // 스토어의 저장 액션 호출
      setStatusMessage({
        type: "success",
        message: "이미지 정보가 포함된 스토리가 저장되었습니다!",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      setStatusMessage({ type: "error", message: "변경사항 저장 실패." });
    } finally {
      setIsBatchProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  if (isComponentLoading) {
    return (
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
          이미지 생성 및 관리{" "}
          <span className="text-2xl font-semibold text-slate-500">
            ({aiMode ? "AI 모드" : "수동 모드"})
          </span>
        </h1>
        <div className="flex gap-3">
          {aiMode && (
            <button
              onClick={handleBatchGenerateImages}
              disabled={isBatchProcessing || localCuts.every((c) => c.imageUrl)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
            >
              {isBatchProcessing ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              {isBatchProcessing ? "일괄 생성 중..." : "AI 이미지 일괄 생성"}
            </button>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={isBatchProcessing}
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

      {statusMessage.message && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {localCuts.map((cut, index) => (
            <ImageCutCard
              key={cut.id || index} // Firestore에서 가져온 실제 ID가 있다면 사용
              cut={cut}
              index={index}
              aiMode={aiMode}
              onGenerateImage={handleGenerateImageForCut}
              onUploadImage={handleUploadImageForCut}
              onRemoveImage={handleRemoveImageForCut}
              isProcessingSpecific={processingCutId === (cut.id || index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg border border-slate-200">
          <ImageOff size={56} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl text-slate-500 mb-2">
            스토리 뷰에서 먼저 컷을 작성해주세요.
          </p>
          <p className="text-sm text-slate-400">
            컷이 있어야 해당 컷에 대한 이미지를 생성하거나 업로드할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
