// client/src/views/Image.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore"; //
import { useStoryStore } from "../store/useStoryStore"; //

import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Sparkles, // AI 이미지 생성 아이콘
  Wand2, // 일괄 적용 아이콘으로도 사용 가능
  ImageOff,
  UploadCloud,
  RefreshCw,
  Trash2,
  // Link as LinkIcon, // 사용 안 함
  Replace,
} from "lucide-react";

// ImageCutCard 컴포넌트는 이전과 거의 동일하게 유지하되,
// onGenerateImage에 cut.id와 cut.text를 전달하도록 합니다.
const ImageCutCard = ({
  cut,
  index,
  aiMode,
  projectImageSettings, // 프로젝트 이미지 설정을 props로 받음
  onGenerateImage, // (cutId, prompt, style, leonardoOptions) => Promise<imageUrl>
  onUploadImage,
  onRemoveImage,
  isProcessingSpecific,
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cut.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false); // 이 상태는 onUploadImage 내부에서 관리될 수 있음

  useEffect(() => {
    setImagePreviewUrl(cut.imageUrl || null);
  }, [cut.imageUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // 임시 미리보기 URL 생성
      const localPreviewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(localPreviewUrl); // 즉시 미리보기 업데이트

      try {
        // onUploadImage는 파일을 스토리지에 업로드하고 최종 URL을 반환하거나,
        // 여기서는 localCuts 상태를 직접 업데이트 한다고 가정.
        // 실제 업로드 로직은 handleUploadImageForCut (ImageView 내부)에서 처리.
        await onUploadImage(cut.id || `cut-${index}`, file, localPreviewUrl);
        // 성공 시 onUploadImage가 localCuts를 업데이트하면 useEffect로 인해 imagePreviewUrl도 최종 URL로 변경될 수 있음
        // 또는 onUploadImage가 직접 새 URL을 반환하면 여기서 setImagePreviewUrl(newUrl) 호출 가능
      } catch (error) {
        console.error(
          "Error uploading image for cut:",
          cut.id || `cut-${index}`,
          error
        );
        if (!cut.imageUrl)
          setImagePreviewUrl(null); // 실패 시 원래 이미지 없으면 미리보기 제거
        else setImagePreviewUrl(cut.imageUrl); // 실패 시 원래 이미지로 복구
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
    onGenerateImage(
      cut.id || `cut-${index}`,
      cut.text, // 프롬프트로 컷 텍스트 사용
      projectImageSettings?.style || "default", // 프로젝트 설정의 이미지 스타일
      {
        // 필요한 경우 여기에 추가 Leonardo AI 옵션 전달
        // 예: width: projectImageSettings?.width, height: projectImageSettings?.height
      }
    );
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
            onClick={handleGenerateClick} // 수정된 핸들러 사용
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

export default function ImageView() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();
  const currentStoryId = storyIdFromUrl || projectIdFromUrl;

  const { aiMode, settings: projectSettings } = useSettingStore(); // 전체 설정 가져오기
  const { story: loadedStory, fetchStory, saveStoryData } = useStoryStore();

  const [localCuts, setLocalCuts] = useState([]);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [processingCutId, setProcessingCutId] = useState(null); // 개별 컷 ID
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    const loadData = async () => {
      setIsComponentLoading(true);
      if (currentStoryId) {
        // fetchSettings는 DetailLayout 등 상위에서 이미 호출되었을 수 있지만,
        // 만약 이 뷰에서 직접 설정을 다시 가져와야 한다면 호출
        // await useSettingStore.getState().fetchSettings(projectIdFromUrl);
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
          id: cut.id || `cut-${index}-${Date.now()}`, // 고유 ID 보장
          text: cut.text || "",
          imageUrl: cut.imageUrl || null,
        }))
      );
    } else {
      setLocalCuts([]);
    }
  }, [loadedStory]);

  const handleGenerateImageForCut = useCallback(
    async (cutId, prompt, style, leonardoOptions = {}) => {
      setProcessingCutId(cutId);
      const cutIndex = localCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 이미지 생성 중... (스타일: ${style})`,
      });
      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiBaseUrl}/generate-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            style, // projectSettings.image.style 값을 전달
            leonardoOptions: {
              // 백엔드에서 받을 수 있는 추가 옵션들
              ...leonardoOptions,
              // 예: width: projectSettings.image?.width, height: projectSettings.image?.height
            },
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
        const data = await response.json();

        setLocalCuts((prevCuts) =>
          prevCuts.map((c) =>
            c.id === cutId ? { ...c, imageUrl: data.imageUrl } : c
          )
        );
        setStatusMessage({
          type: "success",
          message: `컷 #${cutIndex + 1} 이미지 생성 완료!`,
        });
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
    [localCuts /*, projectSettings.image */] // projectSettings.image를 의존성에 추가하면 style 변경 시 함수 재생성
  );

  const handleUploadImageForCut = useCallback(
    async (cutId, file, localPreviewUrl) => {
      // setProcessingCutId(cutId); // ImageCutCard에서 이미 처리 중
      const cutIndex = localCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 이미지 업로드 중...`,
      });
      try {
        // TODO: 실제 파일 업로드 로직 (예: Firebase Storage)
        // const storageUrl = await uploadFileToFirebaseStorage(file, `stories/${currentStoryId}/${cutId}/${file.name}`);
        // 지금은 임시로 로컬 미리보기 URL을 최종 URL로 사용하고 저장 시 이 URL이 저장됨.
        // 프로덕션에서는 실제 스토리지 URL로 대체해야 함.
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 업로드 시뮬레이션
        const imageUrlToSave = localPreviewUrl; // 실제로는 스토리지 URL

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
        // setProcessingCutId(null); // ImageCutCard에서 처리
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      }
    },
    [localCuts, currentStoryId]
  );

  const handleRemoveImageForCut = useCallback(
    (cutId) => {
      setLocalCuts((prevCuts) =>
        prevCuts.map((c) => (c.id === cutId ? { ...c, imageUrl: null } : c))
      );
      const cutIndex = localCuts.findIndex((c) => c.id === cutId);
      setStatusMessage({
        type: "info",
        message: `컷 #${cutIndex + 1} 이미지가 제거되었습니다.`,
      });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
    },
    [localCuts]
  );

  const handleBatchGenerateImages = async () => {
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
          // 이미지가 없고 텍스트(프롬프트)가 있는 컷에 대해서만
          setProcessingCutId(cut.id);
          const cutIndex = localCuts.findIndex((c) => c.id === cut.id);
          setStatusMessage({
            // 개별 컷 상태 업데이트
            type: "info",
            message: `컷 #${cutIndex + 1} 이미지 생성 중... (스타일: ${
              projectSettings.image.style
            })`,
          });

          const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
          const response = await fetch(`${apiBaseUrl}/generate-image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: cut.text,
              style: projectSettings.image.style,
              leonardoOptions: {
                // width: projectSettings.image?.width, height: projectSettings.image?.height
              },
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            console.warn(
              `컷 #${cutIndex + 1} 이미지 생성 실패: ${
                errorData.details || errorData.error
              }`
            );
            // 일괄 작업 중 하나의 실패가 전체를 중단시키지 않도록 처리 가능
            continue; // 다음 컷으로
          }
          const data = await response.json();
          setLocalCuts((prev) =>
            prev.map((c) =>
              c.id === cut.id ? { ...c, imageUrl: data.imageUrl } : c
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
      setStatusMessage({
        type: "error",
        message: `일부 이미지 생성 실패: ${error.message}`,
      });
    } finally {
      setIsBatchProcessing(false);
      setProcessingCutId(null);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  };

  const handleSaveChanges = async () => {
    if (!currentStoryId) {
      setStatusMessage({
        type: "error",
        message: "스토리 ID가 없어 저장할 수 없습니다.",
      });
      return;
    }
    setIsBatchProcessing(true); // 전체 저장 로딩 상태 사용
    setStatusMessage({ type: "info", message: "변경사항 저장 중..." });
    try {
      const storyPayload = {
        ...loadedStory, // 기존 스토리 정보 (id, projectId, storyPrompt 등) 유지
        id: currentStoryId,
        projectId: projectIdFromUrl,
        cutscenes: localCuts.map((c) => ({
          // 저장 시 필요한 필드만 선택하거나, 불필요한 임시 상태 제거
          id: c.id,
          text: c.text,
          imageUrl: c.imageUrl,
          // 여기에 각 컷에 관련된 다른 필드들도 포함 (예: ttsAudioUrl, motionVideoUrl 등)
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
              disabled={
                isBatchProcessing ||
                localCuts.every((c) => c.imageUrl && c.text)
              } // 모든 컷에 이미지가 있거나, 텍스트가 없는 컷만 남았을 때
              className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
            >
              {isBatchProcessing && processingCutId === null ? ( // 전체 일괄 처리 중일 때
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Wand2 size={16} className="mr-2" /> // Sparkles 대신 Wand2 아이콘 사용
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
        <div /* ... 상태 메시지 UI (이전과 동일) ... */
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
              projectImageSettings={projectSettings.image} // 프로젝트 이미지 설정 전달
              onGenerateImage={handleGenerateImageForCut}
              onUploadImage={handleUploadImageForCut}
              onRemoveImage={handleRemoveImageForCut}
              isProcessingSpecific={processingCutId === cut.id}
            />
          ))}
        </div>
      ) : (
        <div /* ... 컷 없음 안내 UI (이전과 동일) ... */
          className="text-center py-16 px-6 bg-white rounded-xl shadow-lg border border-slate-200"
        >
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
