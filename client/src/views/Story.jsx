// src/views/Story.jsx
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
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Wand2,
  Save,
} from "lucide-react";

const parseGeneratedStoryToCuts = (generatedText) => {
  if (
    !generatedText ||
    typeof generatedText.trim() !== "string" ||
    generatedText.trim().length === 0
  ) {
    return [];
  }
  const blocks = generatedText
    .split(/\n(?=(?:컷|Scene)\s*\d+[:\s\n])/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  if (blocks.length === 0) {
    const paragraphs = generatedText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paragraphs.length > 1) {
      return paragraphs.map((p) => ({ text: p }));
    }
    return generatedText.trim() ? [{ text: generatedText.trim() }] : [];
  }

  return blocks
    .map((block) => {
      const contentMatch = block.match(/^(?:컷|Scene)\s*\d+[:\s\n]*(.*)/s);
      const textContent =
        contentMatch && contentMatch[1] ? contentMatch[1].trim() : block;
      return { text: textContent };
    })
    .filter((cut) => cut.text !== undefined && cut.text.length > 0);
};

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
          {" "}
          <Trash2 size={18} />{" "}
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

  const settingsAiMode = useSettingStore((state) => state.aiMode);
  const settingsContents = useSettingStore((state) => state.settings.contents);
  const settingsStory = useSettingStore((state) => state.settings.story);
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
        await fetchSettings(projectIdFromUrl);
        const currentStoryId = storyIdFromUrl || projectIdFromUrl;
        await storyStore.fetchStory(currentStoryId, projectIdFromUrl);
      } else {
        setLocalCuts([]);
        setLocalProductImageUrl("");
        setLocalStoryPrompt("");
      }
      setIsComponentLoading(false);
    };
    loadInitialData();
  }, [projectIdFromUrl, storyIdFromUrl, fetchSettings, storyStore.fetchStory]);

  useEffect(() => {
    if (loadedStory) {
      setLocalCuts(loadedStory.cutscenes || []);
      setLocalProductImageUrl(loadedStory.productImageUrl || "");
      setLocalStoryPrompt(loadedStory.storyPrompt || "");
    }
  }, [loadedStory]);

  const handleStoryCutChange = useCallback((index, newText) => {
    setLocalCuts((prevCuts) =>
      prevCuts.map((cut, i) => (i === index ? { ...cut, text: newText } : cut))
    );
  }, []);

  const handleAddStoryCut = useCallback(() => {
    setLocalCuts((prevCuts) => [...prevCuts, { text: "" }]);
  }, []);

  const handleRemoveStoryCut = useCallback((indexToRemove) => {
    setLocalCuts((prevCuts) =>
      prevCuts.filter((_, index) => index !== indexToRemove)
    );
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
      // 백엔드 API 호출
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"
        }/generate-ai-story`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storyPrompt: localStoryPrompt,
            productImageUrl: localProductImageUrl,
            projectSettings: projectSettings, // useSettingStore에서 가져온 전체 설정 객체 전달
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            `AI 스토리 생성 API 오류: ${response.status}`
        );
      }

      const data = await response.json();
      const generatedText = data.story;

      // 이제 parseGeneratedStoryToCuts는 안정적인 참조이므로 의존성 배열에서 제거하거나 그대로 둬도 됨
      const parsedCuts = parseGeneratedStoryToCuts(generatedText); // 이 함수는 이미 Story.jsx에 있음
      setLocalCuts(parsedCuts);
      setStatusMessage({
        type: "success",
        message: "AI 스토리가 성공적으로 생성되었습니다!",
      });
    } catch (error) {
      console.error("AI 스토리 생성 실패:", error); // 콘솔에 에러 출력 변경
      setStatusMessage({
        type: "error",
        message: `AI 스토리 생성에 실패했습니다: ${error.message}`,
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
    // 의존성 배열에 projectSettings 추가
  }, [
    localStoryPrompt,
    localProductImageUrl,
    projectSettings,
    parseGeneratedStoryToCuts,
  ]); // setLocalCuts, setStatusMessage, setIsProcessing 등 상태 변경 함수도 필요시 추가

  const handleProductImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setStatusMessage({ type: "info", message: "이미지 업로드 중..." });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockImageUrl = URL.createObjectURL(file);
      setLocalProductImageUrl(mockImageUrl);
      setStatusMessage({
        type: "success",
        message: "상품 이미지가 업로드되었습니다.",
      });
    } catch (error) {
      console.log(error);

      setStatusMessage({
        type: "error",
        message: "이미지 업로드에 실패했습니다.",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000);
    }
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
      cutscenes: localCuts,
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
      setStatusMessage({
        type: "error",
        message: `스토리 저장에 실패했습니다: ${error.message}`,
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
        <Loader2 size={48} className="animate-spin" />
        <span className="ml-3 text-xl mt-4">데이터 불러오는 중...</span>
      </div>
    );
  }

  if (storyError && !loadedStory) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600">
        <AlertCircle size={48} />
        <span className="ml-3 text-xl mt-4">
          스토리 로드 실패: {storyError}
        </span>
        <p className="text-sm text-slate-500 mt-2">
          새로고침하거나 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  return (
    // ... (이하 JSX 렌더링 부분은 이전과 동일)
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
          className={`flex items-center p-4 rounded-lg mb-6 shadow transition-all duration-300 text-sm font-medium
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
            <Loader2 size={20} className="animate-spin mr-2.5 flex-shrink-0" />
          )}
          {statusMessage.message}
        </div>
      )}

      {settingsAiMode && (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 border border-slate-200">
          <div className="flex items-center mb-6">
            {" "}
            <Bot size={28} className="text-purple-500 mr-3" />{" "}
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
              AI 스토리 생성 옵션
            </h2>{" "}
          </div>
          <p className="text-slate-600 text-sm mb-6">
            {" "}
            스토리 프롬프트와 상품 이미지를 입력하면, AI가 프로젝트 설정
            (플랫폼: {settingsContents.platform}, 유형: {settingsContents.type},
            언어: {settingsStory.language}, 캐릭터:{" "}
            {settingsStory.mainCharacter || "미지정"})을 바탕으로 스토리를
            생성해줍니다.{" "}
          </p>
          <div className="space-y-6">
            <div>
              {" "}
              <label
                htmlFor="story-prompt"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                스토리 프롬프트
              </label>{" "}
              <textarea
                id="story-prompt"
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[100px]"
                placeholder="예: 여름 휴가를 위한 30초 유튜브 쇼츠..."
                value={localStoryPrompt}
                onChange={(e) => setLocalStoryPrompt(e.target.value)}
                disabled={isProcessing}
              />{" "}
            </div>
            <div>
              {" "}
              <label
                htmlFor="product-image-upload"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                상품/참고 이미지 (선택 사항)
              </label>{" "}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {" "}
                <input
                  type="file"
                  id="product-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductImageUpload}
                  disabled={isProcessing}
                />{" "}
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-image-upload").click()
                  }
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
                >
                  {" "}
                  <UploadCloud size={18} className="mr-2" />
                  이미지 선택
                </button>{" "}
                {localProductImageUrl && (
                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-md border border-slate-200 text-xs text-slate-600">
                    {" "}
                    <img
                      src={localProductImageUrl}
                      alt="Uploaded Product"
                      className="w-12 h-12 object-cover rounded border"
                    />{" "}
                    <span>이미지 준비됨</span>{" "}
                  </div>
                )}{" "}
              </div>{" "}
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
            {" "}
            {isProcessing ? (
              <Loader2 size={22} className="animate-spin mr-2" />
            ) : (
              <Wand2 size={20} className="mr-2" />
            )}{" "}
            {isProcessing ? "스토리 생성 중..." : "AI 스토리 생성 / 수정"}
          </button>
        </div>
      )}

      {!settingsAiMode && (
        <div className="bg-green-50 p-4 rounded-xl flex items-start text-green-800 mb-8 border border-green-200 shadow">
          {" "}
          <AlertCircle
            size={22}
            className="text-green-600 mr-3 mt-0.5 flex-shrink-0"
          />{" "}
          <div>
            {" "}
            <h3 className="font-semibold text-base">수동 모드</h3>{" "}
            <p className="text-sm">
              스토리를 컷 단위로 직접 작성하고 관리합니다.
            </p>{" "}
          </div>{" "}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          {" "}
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 flex items-center">
            {" "}
            <BookOpen size={26} className="text-green-500 mr-2.5" /> 스토리 컷
            목록{" "}
          </h2>{" "}
          <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
            총 {localCuts.length} 컷
          </span>{" "}
        </div>
        {localCuts.length > 0 ? (
          localCuts.map((storyCut, index) => (
            <StoryCutCard
              key={index}
              index={index}
              storyCut={storyCut}
              onTextChange={handleStoryCutChange}
              onRemove={handleRemoveStoryCut}
            />
          ))
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg border border-slate-200">
            {" "}
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />{" "}
            <p className="text-lg text-slate-500 mb-2">
              {settingsAiMode
                ? "AI가 생성한 스토리가 여기에 표시됩니다."
                : "아직 추가된 컷이 없습니다."}
            </p>{" "}
            <p className="text-sm text-slate-400">
              {settingsAiMode
                ? "위의 'AI 스토리 생성' 버튼을 클릭하거나, 직접 컷을 추가해보세요."
                : "'새로운 컷 추가' 버튼을 클릭하여 스토리를 만들어보세요."}
            </p>{" "}
          </div>
        )}
      </div>

      <button
        onClick={handleAddStoryCut}
        disabled={isProcessing}
        className="w-full flex items-center justify-center py-3.5 px-6 mt-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
      >
        {" "}
        <Plus size={20} className="mr-2" />
        <span className="text-base sm:text-lg font-semibold">
          새로운 컷 추가
        </span>
      </button>
      <div className="mt-12 flex flex-col items-center">
        {" "}
        <button
          onClick={handleSaveStory}
          disabled={isProcessing || localCuts.length === 0}
          className={`px-10 py-3.5 rounded-lg text-lg font-semibold text-white flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
            isProcessing || localCuts.length === 0
              ? "bg-blue-400 cursor-not-allowed focus:ring-blue-300"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl focus:ring-blue-500"
          }`}
        >
          {" "}
          {isProcessing && storyLoading ? (
            <Loader2 size={22} className="animate-spin mr-2.5" />
          ) : (
            <Save size={20} className="mr-2.5" />
          )}{" "}
          {isProcessing && storyLoading ? "저장 중..." : "스토리 저장"}{" "}
        </button>{" "}
      </div>
    </div>
  );
}
