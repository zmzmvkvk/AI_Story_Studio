// client/src/views/Image.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { useStoryStore } from "../store/useStoryStore";

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
  Replace,
} from "lucide-react";

// ImageCutCard 컴포넌트 (이전과 동일하게 유지)
const ImageCutCard = ({
  cut,
  index,
  aiMode,
  projectImageSettings,
  onGenerateImage,
  onUploadImage,
  onRemoveImage,
  isProcessingSpecific,
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cut.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImagePreviewUrl(cut.imageUrl || null);
  }, [cut.imageUrl]);

  let aspectRatioClass = "aspect-video";
  if (projectImageSettings && projectImageSettings.aspectRatio) {
    const ratioString = projectImageSettings.aspectRatio;
    const [ratioW, ratioH] = ratioString.split(":");
    if (ratioW && ratioH) {
      aspectRatioClass = `aspect-[${ratioW}/${ratioH}]`;
    }
  } else if (
    projectImageSettings &&
    projectImageSettings.width &&
    projectImageSettings.height
  ) {
    aspectRatioClass = `aspect-[${projectImageSettings.width}/${projectImageSettings.height}]`;
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      const localPreviewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(localPreviewUrl);
      try {
        await onUploadImage(cut.id || `cut-${index}`, file, localPreviewUrl);
      } catch (error) {
        console.error(
          "Error uploading image for cut:",
          cut.id || `cut-${index}`,
          error
        );
        if (!cut.imageUrl) setImagePreviewUrl(null);
        else setImagePreviewUrl(cut.imageUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const inputId = `file-upload-${cut.id || index}`;

  const handleGenerateClick = () => {
    if (!cut.text) {
      alert("이미지를 생성하기 위한 컷 내용(프롬프트)이 없습니다.");
      return;
    }
    onGenerateImage(cut.id || `cut-${index}`, cut.text, projectImageSettings);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            컷 #{index + 1}
          </h3>
          <p
            className="text-xs text-slate-500 line-clamp-2 h-8"
            title={cut.text}
          >
            {cut.text || "내용 없음"}
          </p>
        </div>
        {imagePreviewUrl && !isProcessingSpecific && !isUploading && (
          <button
            onClick={() => onRemoveImage(cut.id || `cut-${index}`)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors flex-shrink-0 ml-2"
            title="이미지 삭제"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <div
        className={`bg-slate-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden border border-slate-200 ${aspectRatioClass}`}
      >
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
            onClick={handleGenerateClick}
            disabled={isProcessingSpecific || isUploading || !cut.text}
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

// ImageView 컴포넌트
export default function ImageView() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();
  const currentStoryId = storyIdFromUrl || projectIdFromUrl;

  const { aiMode, settings: projectSettings } = useSettingStore();
  const { story: loadedStory, fetchStory, saveStoryData } = useStoryStore();

  const [localCuts, setLocalCuts] = useState([]);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [processingCutId, setProcessingCutId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

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

  useEffect(() => {
    if (loadedStory?.cutscenes) {
      setLocalCuts(
        loadedStory.cutscenes.map((cut, index) => ({
          ...cut,
          id: cut.id || `cut-${index}-${Date.now()}`,
          text: cut.text || "",
          imageUrl: cut.imageUrl || null,
        }))
      );
    } else {
      setLocalCuts([]);
    }
  }, [loadedStory]);

  const handleGenerateImageForCut = useCallback(
    // 'prompt' 파라미터는 여기서는 'originalKoreanCutText'임
    async (cutId, originalKoreanCutText, projImgSettings) => {
      setProcessingCutId(cutId);
      const cutIndex = localCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 이미지 생성 중... (스타일: ${
          projImgSettings?.stylePreset || "default"
        })`,
      });
      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiBaseUrl}/generate-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: originalKoreanCutText, // 원본 한국어 텍스트 전달
            projectImageSettings: projImgSettings,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.details ||
              errorData.error ||
              `이미지 생성 API 오류: ${response.status}`
          );
        }
        const data = await response.json(); // data 객체에 imageUrl, jobDetails 등이 포함됨

        setLocalCuts((prevCuts) =>
          prevCuts.map((c) =>
            c.id === cutId ? { ...c, imageUrl: data.imageUrl } : c
          )
        );
        setStatusMessage({
          type: "success",
          message: data.message || `컷 #${cutIndex + 1} 이미지 생성 완료!`, // 서버 메시지 사용
        });

        // --- 콘솔 로깅 추가 ---
        console.groupCollapsed(
          `[AI 이미지 생성 완료] 컷 #${cutIndex + 1} 상세 정보`
        );
        console.log("요청 ID (Cut ID):", cutId);
        console.log(
          "원본 한국어 프롬프트 (클라이언트):",
          originalKoreanCutText
        );
        console.log(
          "적용된 프로젝트 이미지 설정 (클라이언트):",
          projImgSettings
        );

        if (data.jobDetails) {
          console.log(
            "--- Leonardo AI 실제 사용 파라미터 (서버 응답 기반) ---"
          );
          console.log("최종 영어 프롬프트 (GPT 생성):", data.jobDetails.prompt);
          console.log("모델 ID:", data.jobDetails.modelId);
          console.log("SD 버전:", data.jobDetails.sdVersion);
          console.log("너비 (Width):", data.jobDetails.width);
          console.log("높이 (Height):", data.jobDetails.height);
          console.log("스타일 프리셋:", data.jobDetails.presetStyle);
          console.log("가이던스 스케일:", data.jobDetails.guidanceScale);
          console.log("네거티브 프롬프트:", data.jobDetails.negativePrompt);
          console.log("Alchemy 사용:", data.jobDetails.alchemyMode); // 필드명은 API 응답에 따라 다를 수 있음
          console.log("PhotoReal 사용:", data.jobDetails.photoReal); // 필드명은 API 응답에 따라 다를 수 있음
          console.log("Prompt Magic 사용:", data.jobDetails.promptMagic); // 필드명은 API 응답에 따라 다를 수 있음
          console.log("스케줄러:", data.jobDetails.scheduler);
          console.log("시드(Seed):", data.jobDetails.seed);
          console.log("전체 Job 상세 정보 (jobDetails):", data.jobDetails);
        } else {
          console.warn(
            "서버 응답에 'jobDetails'가 없어 Leonardo AI 실제 사용 파라미터를 정확히 로깅할 수 없습니다."
          );
        }
        if (data.gptGeneratedPrompt) {
          // 서버에서 gptGeneratedPrompt를 명시적으로 보내준다면 로깅
          console.log(
            "GPT가 생성한 영어 프롬프트 (서버 직접 전달):",
            data.gptGeneratedPrompt
          );
        }
        if (data.requestSettings) {
          // 서버에서 requestSettings를 명시적으로 보내준다면 로깅
          console.log(
            "클라이언트가 보낸 이미지 설정 (서버 확인용):",
            data.requestSettings
          );
        }
        console.groupEnd();
        // --- 콘솔 로깅 종료 ---
      } catch (error) {
        console.error("Error generating AI image for cut:", cutId, error);
        setStatusMessage({
          type: "error",
          message: `이미지 생성 실패: ${error.message}`,
        });
      } finally {
        setProcessingCutId(null);
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [localCuts]
  );

  const handleUploadImageForCut = useCallback(
    async (cutId, file, localPreviewUrl) => {
      // ... (이전과 동일)
      const cutIndex = localCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 이미지 업로드 중...`,
      });
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const imageUrlToSave = localPreviewUrl;

        setLocalCuts((prevCuts) =>
          prevCuts.map((c) =>
            c.id === cutId ? { ...c, imageUrl: imageUrlToSave } : c
          )
        );
        setStatusMessage({
          type: "success",
          message: `컷 #${cutIndex + 1} 이미지 업로드 완료! (미리보기)`,
        });
        return imageUrlToSave;
      } catch (error) {
        console.error("Error uploading image for cut:", cutId, error);
        setStatusMessage({ type: "error", message: "이미지 업로드 실패." });
        throw error;
      } finally {
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [localCuts, currentStoryId]
  );

  const handleRemoveImageForCut = useCallback(
    (cutId) => {
      // ... (이전과 동일)
      const cutIndex = localCuts.findIndex((c) => c.id === cutId);
      setLocalCuts((prevCuts) =>
        prevCuts.map((c) => (c.id === cutId ? { ...c, imageUrl: null } : c))
      );
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 이미지가 제거되었습니다.`,
      });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    },
    [localCuts]
  );

  const handleBatchGenerateImages = async () => {
    // ... (이전과 동일, 단 성공 시 로깅 추가)
    if (!projectSettings || !projectSettings.image) {
      alert("프로젝트 이미지 설정을 먼저 로드해주세요.");
      return;
    }
    setIsBatchProcessing(true);
    setStatusMessage({
      type: "info",
      message: "모든 컷에 대해 AI 이미지 일괄 생성 중...",
    });
    let successCount = 0;
    try {
      for (const cut of localCuts) {
        if (!cut.imageUrl && cut.text) {
          setProcessingCutId(cut.id);
          const cutIndex = localCuts.findIndex((c) => c.id === cut.id);
          setStatusMessage({
            type: "info",
            message: `컷 #${cutIndex + 1} 이미지 생성 중... (스타일: ${
              projectSettings.image.stylePreset || "default"
            })`,
          });

          const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
          const response = await fetch(`${apiBaseUrl}/generate-image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: cut.text,
              projectImageSettings: projectSettings.image,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            console.warn(
              `컷 #${cutIndex + 1} 이미지 생성 실패 (일괄): ${
                errorData.details || errorData.error
              }`
            );
            continue;
          }
          const data = await response.json();
          setLocalCuts((prev) =>
            prev.map((c) =>
              c.id === cut.id ? { ...c, imageUrl: data.imageUrl } : c
            )
          );
          successCount++;

          // --- 콘솔 로깅 추가 (일괄 처리용) ---
          console.groupCollapsed(
            `[AI 이미지 생성 완료 - 일괄] 컷 #${cutIndex + 1} (${
              cut.id
            }) 상세 정보`
          );
          console.log("원본 한국어 프롬프트 (클라이언트):", cut.text);
          console.log(
            "적용된 프로젝트 이미지 설정 (클라이언트):",
            projectSettings.image
          );
          if (data.jobDetails) {
            console.log(
              "--- Leonardo AI 실제 사용 파라미터 (서버 응답 기반) ---"
            );
            console.log(
              "최종 영어 프롬프트 (GPT 생성):",
              data.jobDetails.prompt
            );
            console.log("모델 ID:", data.jobDetails.modelId);
            // ... (개별 생성과 동일한 상세 로깅) ...
            console.log("전체 Job 상세 정보 (jobDetails):", data.jobDetails);
          } else {
            console.warn(
              "서버 응답에 'jobDetails'가 없어 Leonardo AI 실제 사용 파라미터를 정확히 로깅할 수 없습니다. (일괄)"
            );
          }
          console.groupEnd();
          // --- 콘솔 로깅 종료 ---
        }
      }
      setStatusMessage({
        type: "success",
        message: `${successCount}개의 이미지 일괄 생성 완료! (프롬프트 by GPT)`,
      });
    } catch (error) {
      console.error("Error batch generating AI images:", error);
      setStatusMessage({
        type: "error",
        message: `일부 이미지 생성 실패 (일괄): ${error.message}`,
      });
    } finally {
      setIsBatchProcessing(false);
      setProcessingCutId(null);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  const handleSaveChanges = async () => {
    // ... (이전과 동일)
    if (!currentStoryId) {
      setStatusMessage({
        type: "error",
        message: "스토리 ID가 없어 저장할 수 없습니다.",
      });
      return;
    }
    setIsBatchProcessing(true);
    setStatusMessage({ type: "info", message: "변경사항 저장 중..." });
    try {
      const storyPayload = {
        ...loadedStory,
        id: currentStoryId,
        projectId: projectIdFromUrl,
        cutscenes: localCuts.map((c) => ({
          id: c.id,
          text: c.text,
          imageUrl: c.imageUrl,
        })),
      };
      await saveStoryData(storyPayload);
      setStatusMessage({
        type: "success",
        message: "이미지 정보가 포함된 스토리가 저장되었습니다!",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      setStatusMessage({
        type: "error",
        message: `변경사항 저장 실패: ${error.message}`,
      });
    } finally {
      setIsBatchProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  if (isComponentLoading) {
    // ... (이전과 동일)
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-blue-600">
        <Loader2 size={48} className="animate-spin" />
        <span className="ml-3 text-xl mt-4">데이터 불러오는 중...</span>
      </div>
    );
  }

  return (
    // ... (이전과 동일한 JSX 구조) ...
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
              disabled={
                isBatchProcessing ||
                localCuts.every((c) => c.imageUrl || !c.text)
              }
              className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
            >
              {isBatchProcessing && processingCutId === null ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Wand2 size={16} className="mr-2" />
              )}
              {isBatchProcessing && processingCutId === null
                ? "일괄 생성 중..."
                : "AI 이미지 일괄 생성"}
            </button>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={isBatchProcessing || isComponentLoading}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          >
            {isBatchProcessing && processingCutId === null ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {isBatchProcessing && processingCutId === null
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
              key={cut.id}
              cut={cut}
              index={index}
              aiMode={aiMode}
              projectImageSettings={projectSettings.image}
              onGenerateImage={handleGenerateImageForCut}
              onUploadImage={handleUploadImageForCut}
              onRemoveImage={handleRemoveImageForCut}
              isProcessingSpecific={processingCutId === cut.id}
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
