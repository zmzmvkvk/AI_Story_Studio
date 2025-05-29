// client/src/views/Story.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { useStoryStore } from "../store/useStoryStore";
import {
  Plus,
  Trash2,
  Bot,
  UploadCloud,
  RefreshCw,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Wand2,
  Save,
} from "lucide-react";

const StoryCutCard = ({ index, storyCut, onTextChange, onRemove }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        72
      )}px`;
    }
  }, [storyCut.text]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 relative transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-700">
          컷 #{index + 1}
        </h3>
        <button
          onClick={() => onRemove(index)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
          title="컷 삭제"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="w-full p-3 border border-slate-300 rounded-lg text-slate-800 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[72px]"
        value={storyCut.text || ""}
        onChange={(e) => onTextChange(index, e.target.value)}
        placeholder={`컷 ${index + 1}의 스토리를 입력하세요...`}
        rows="3"
      />
    </div>
  );
};

export default function StoryEditor() {
  const { id: projectIdFromUrl, storyId: storyIdFromUrl } = useParams();

  const projectSettings = useSettingStore((state) => state.settings);
  const settingsAiMode = useSettingStore((state) => state.aiMode);
  const fetchSettings = useSettingStore((state) => state.fetchSettings);

  const storyStore = useStoryStore();
  const {
    story: loadedStory,
    loading: storyLoading,
    error: storyError,
  } = useStoryStore();

  const [localCuts, setLocalCuts] = useState([]);
  const [localProductImageUrl, setLocalProductImageUrl] = useState("");
  const [localStoryPrompt, setLocalStoryPrompt] = useState("");
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsComponentLoading(true);
      if (projectIdFromUrl) {
        // Setting.jsx에서 이미 fetch되었을 수 있으나, Story.jsx 직접 접근 시 필요할 수 있음
        await fetchSettings(projectIdFromUrl);
        const currentStoryId = storyIdFromUrl || projectIdFromUrl;
        await storyStore.fetchStory(currentStoryId, projectIdFromUrl);
      }
      setIsComponentLoading(false);
    };
    loadInitialData();
  }, [projectIdFromUrl, storyIdFromUrl, fetchSettings, storyStore.fetchStory]);

  useEffect(() => {
    if (loadedStory) {
      setLocalCuts(
        loadedStory.cutscenes?.map((cut, index) => ({
          id: cut.id || `cut-${Date.now()}-${index}`,
          text: cut.text || "",
          imageUrl: cut.imageUrl || null,
        })) || []
      );
      setLocalProductImageUrl(loadedStory.productImageUrl || "");
      setLocalStoryPrompt(loadedStory.storyPrompt || "");
    }
  }, [loadedStory]);

  const parseGeneratedStoryToCuts = useCallback((generatedText) => {
    if (
      !generatedText ||
      typeof generatedText.trim() !== "string" ||
      generatedText.trim().length === 0
    )
      return [];
    const cutsArray = [];
    const cutBlockRegex = /(?:컷|Scene|Cut)\s*#?\s*\d+\s*[:\-.]?\s*/gi;
    const contentBlocks = generatedText
      .split(cutBlockRegex)
      .filter((block) => block && block.trim().length > 0);
    if (contentBlocks.length === 0 && generatedText.trim().length > 0) {
      return [
        {
          id: `cut-${Date.now()}-0`,
          text: generatedText.trim(),
          imageUrl: null,
        },
      ];
    }
    contentBlocks.forEach((blockText, index) => {
      const trimmedText = blockText.trim();
      if (trimmedText) {
        cutsArray.push({
          id: `cut-${Date.now()}-${index}`,
          text: trimmedText,
          imageUrl: null,
        });
      }
    });
    return cutsArray.filter((cut) => cut.text && cut.text.length > 0);
  }, []);

  const handleStoryCutChange = useCallback((index, newText) => {
    setLocalCuts((prev) =>
      prev.map((cut, i) => (i === index ? { ...cut, text: newText } : cut))
    );
  }, []);

  const handleAddStoryCut = useCallback(() => {
    setLocalCuts((prev) => [
      ...prev,
      { id: `cut-${Date.now()}-${prev.length}`, text: "", imageUrl: null },
    ]);
  }, []);

  const handleRemoveStoryCut = useCallback((indexToRemove) => {
    setLocalCuts((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleGenerateAIStory = useCallback(async () => {
    if (!localStoryPrompt && !localProductImageUrl) {
      setStatusMessage({
        type: "error",
        message: "스토리 프롬프트나 상품 이미지를 입력/업로드해주세요.",
      });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      return;
    }
    setIsProcessing(true);
    setStatusMessage({
      type: "info",
      message: "AI가 스토리를 생성 중입니다...",
    });
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
      const response = await fetch(`${apiBaseUrl}/generate-ai-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyPrompt: localStoryPrompt,
          productImageUrl: localProductImageUrl,
          projectSettings,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || `API 오류: ${response.status}`
        );
      }
      const data = await response.json();
      setLocalCuts(parseGeneratedStoryToCuts(data.story));
      setStatusMessage({
        type: "success",
        message: "AI 스토리가 성공적으로 생성되었습니다!",
      });
    } catch (error) {
      console.error("AI 스토리 생성 실패:", error);
      setStatusMessage({
        type: "error",
        message: `AI 스토리 생성 실패: ${error.message}`,
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  }, [
    localStoryPrompt,
    localProductImageUrl,
    projectSettings,
    parseGeneratedStoryToCuts,
  ]);

  const handleProductImageUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalProductImageUrl(URL.createObjectURL(file));
    setStatusMessage({
      type: "success",
      message: "상품 이미지가 선택되었습니다 (저장 시 반영).",
    });
    setTimeout(() => setStatusMessage({ type: "", message: "" }), 2000);
  }, []);

  const handleSaveStory = useCallback(async () => {
    const currentStoryId = storyIdFromUrl || projectIdFromUrl;
    if (!currentStoryId) {
      setStatusMessage({
        type: "error",
        message: "스토리 ID가 없어 저장할 수 없습니다.",
      });
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
      return;
    }
    setIsProcessing(true);
    setStatusMessage({ type: "info", message: "스토리 저장 중..." });
    const storyPayload = {
      id: currentStoryId,
      projectId: projectIdFromUrl,
      cutscenes: localCuts.map((c) => ({
        id: c.id,
        text: c.text,
        imageUrl: c.imageUrl,
      })),
      productImageUrl: localProductImageUrl,
      storyPrompt: localStoryPrompt,
      aiMode: settingsAiMode,
    };
    try {
      await storyStore.saveStoryData(storyPayload);
      setStatusMessage({
        type: "success",
        message: "스토리가 성공적으로 저장되었습니다!",
      });
    } catch (error) {
      console.error("스토리 저장 실패:", error);
      setStatusMessage({
        type: "error",
        message: `스토리 저장 실패: ${error.message}`,
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
  }, [
    projectIdFromUrl,
    storyIdFromUrl,
    localCuts,
    localProductImageUrl,
    localStoryPrompt,
    settingsAiMode,
    storyStore.saveStoryData,
  ]);

  if (isComponentLoading || storyLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-blue-600">
        <LoaderCircle size={48} className="animate-spin" />
        <span className="ml-3 text-xl mt-4">데이터 불러오는 중...</span>
      </div>
    );
  }

  if (storyError && !loadedStory) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600">
        <AlertCircle size={48} />
        <span className="ml-3 text-xl mt-4">
          스토리 로드 실패:{" "}
          {typeof storyError === "string" ? storyError : storyError.message}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-8 text-center">
        스토리 편집{" "}
        <span
          className={`text-2xl font-semibold ${
            settingsAiMode ? "text-purple-600" : "text-green-600"
          }`}
        >
          ({settingsAiMode ? "AI 모드" : "수동 모드"})
        </span>
      </h1>

      {statusMessage.message && (
        <div
          className={`flex items-center p-4 rounded-lg mb-6 shadow text-sm font-medium
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
            <CheckCircle size={20} className="mr-2.5 flex-shrink-0" />
          )}
          {statusMessage.type === "error" && (
            <AlertCircle size={20} className="mr-2.5 flex-shrink-0" />
          )}
          {statusMessage.type === "info" && (
            <LoaderCircle
              size={20}
              className="animate-spin mr-2.5 flex-shrink-0"
            />
          )}
          {statusMessage.message}
        </div>
      )}

      {settingsAiMode && (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 border border-slate-200">
          <div className="flex items-center mb-6">
            <Bot size={28} className="text-purple-500 mr-3" />
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
              AI 스토리 생성 옵션
            </h2>
          </div>
          <p className="text-slate-600 text-sm mb-6">
            스토리 프롬프트와 상품 이미지를 입력하면, AI가 프로젝트 설정
            (플랫폼: {projectSettings.contents.platform}, 유형:{" "}
            {projectSettings.contents.type}, 언어:{" "}
            {projectSettings.story.language}, 캐릭터:{" "}
            {projectSettings.story.mainCharacter?.name || "미지정"})을 바탕으로
            스토리를 생성합니다.
          </p>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="story-prompt"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                스토리 프롬프트
              </label>
              <textarea
                id="story-prompt"
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[100px]"
                placeholder="예: 여름 휴가를 위한 30초 유튜브 쇼츠..."
                value={localStoryPrompt}
                onChange={(e) => setLocalStoryPrompt(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div>
              <label
                htmlFor="product-image-upload"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                상품/참고 이미지 (선택)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  id="product-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductImageUpload}
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-image-upload").click()
                  }
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
                >
                  <UploadCloud size={18} className="mr-2" /> 이미지 선택
                </button>
                {localProductImageUrl && (
                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-md border border-slate-200 text-xs text-slate-600">
                    <img
                      src={localProductImageUrl}
                      alt="Uploaded Product"
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <span>
                      {localProductImageUrl.startsWith("blob:")
                        ? "이미지 준비됨 (미리보기)"
                        : "이미지 준비됨"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerateAIStory}
            disabled={isProcessing}
            className={`mt-8 w-full py-3 px-6 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
              isProcessing
                ? "bg-purple-400 cursor-not-allowed focus:ring-purple-300"
                : "bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl focus:ring-purple-500"
            }`}
          >
            {isProcessing && !storyLoading ? (
              <LoaderCircle size={22} className="animate-spin mr-2" />
            ) : (
              <Wand2 size={20} className="mr-2" />
            )}
            {isProcessing && !storyLoading
              ? "스토리 생성 중..."
              : "AI 스토리 생성 / 수정"}
          </button>
        </div>
      )}

      {!settingsAiMode && (
        <div className="bg-green-50 p-4 rounded-xl flex items-start text-green-800 mb-8 border border-green-200 shadow">
          <AlertCircle
            size={22}
            className="text-green-600 mr-3 mt-0.5 flex-shrink-0"
          />
          <div>
            <h3 className="font-semibold text-base">수동 모드</h3>
            <p className="text-sm">
              스토리를 컷 단위로 직접 작성하고 관리합니다.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 flex items-center">
            <BookOpen size={26} className="text-green-500 mr-2.5" /> 스토리 컷
            목록
          </h2>
          <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
            총 {localCuts.length} 컷
          </span>
        </div>
        {localCuts.length > 0 ? (
          localCuts.map((storyCut, index) => (
            <StoryCutCard
              key={storyCut.id || index}
              index={index}
              storyCut={storyCut}
              onTextChange={handleStoryCutChange}
              onRemove={handleRemoveStoryCut}
            />
          ))
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-slate-500 mb-2">
              {settingsAiMode
                ? "AI가 생성한 스토리가 여기에 표시됩니다."
                : "아직 추가된 컷이 없습니다."}
            </p>
            <p className="text-sm text-slate-400">
              {settingsAiMode
                ? "위의 'AI 스토리 생성' 버튼을 클릭하거나, 직접 컷을 추가해보세요."
                : "'새로운 컷 추가' 버튼을 클릭하여 스토리를 만들어보세요."}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleAddStoryCut}
        disabled={isProcessing}
        className="w-full flex items-center justify-center py-3.5 px-6 mt-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
      >
        <Plus size={20} className="mr-2" />
        <span className="text-base sm:text-lg font-semibold">
          새로운 컷 추가
        </span>
      </button>
      <div className="mt-12 flex flex-col items-center">
        <button
          onClick={handleSaveStory}
          disabled={isProcessing || storyLoading || localCuts.length === 0}
          className={`px-10 py-3.5 rounded-lg text-lg font-semibold text-white flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
            isProcessing || storyLoading || localCuts.length === 0
              ? "bg-blue-400 cursor-not-allowed focus:ring-blue-300"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl focus:ring-blue-500"
          }`}
        >
          {(isProcessing && !storyLoading) || storyLoading ? (
            <LoaderCircle size={22} className="animate-spin mr-2.5" />
          ) : (
            <Save size={20} className="mr-2.5" />
          )}
          {isProcessing && !storyLoading
            ? "처리 중..."
            : storyLoading
            ? "로딩 중..."
            : "스토리 저장"}
        </button>
      </div>
    </div>
  );
}
