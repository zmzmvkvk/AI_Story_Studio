// client/src/views/Setting.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { Loader2, CheckCircle, Save } from "lucide-react";

import ContentsSettings from "../components/Settings/ContentsSettings";
import StorySettings from "../components/Settings/StorySettings";
import ImageSettings from "../components/Settings/ImageSettings";
import VideoSettings from "../components/Settings/VideoSettings";
import TtsSettings from "../components/Settings/TtsSettings";

export default function Setting() {
  const { id: projectId } = useParams();
  // 스토어에서 필요한 상태와 액션을 직접 가져옵니다.
  const {
    aiMode,
    settings,
    setAiMode,
    setSetting, // 개별 항목 업데이트용 액션
    fetchSettings,
    saveSettings,
    loading: storeLoading, // 스토어의 로딩 상태
    saving: storeSaving, // 스토어의 저장 상태
    // error: storeError    // 스토어 에러 (필요시 사용)
  } = useSettingStore();

  // 이 컴포넌트 자체의 로딩 상태 (초기 fetchSettings 완료 여부)
  const [isPageLoading, setIsPageLoading] = useState(true);
  // 저장 성공 메시지용 상태 (기존 isSaving은 storeSaving으로 대체)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsPageLoading(true); // 페이지 로딩 시작
      if (projectId) {
        await fetchSettings(projectId);
      }
      setIsPageLoading(false); // 페이지 로딩 완료
    };
    loadSettings();
  }, [projectId, fetchSettings]); // fetchSettings는 스토어 액션이므로 안정적

  const handleAiModeToggle = () => {
    setAiMode(!aiMode);
  };

  const handleSave = async () => {
    if (!projectId) return;
    // storeSaving 상태를 사용하므로 setIsSaving 불필요
    setSaveSuccessMessage(false);
    try {
      await saveSettings(projectId); // 스토어의 저장 액션 호출
      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 2500);
    } catch (error) {
      // 에러는 스토어에서 관리하거나, 여기서 별도 상태로 관리 가능
      console.error("Save settings failed from component:", error);
    }
  };

  // isPageLoading은 fetchSettings 완료 여부, storeLoading은 fetchSettings 내부의 로딩 상태
  if (isPageLoading || storeLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-blue-600">
        <Loader2 size={48} className="animate-spin" />
        <span className="ml-3 text-xl mt-4">설정 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-10 text-center">
        프로젝트 설정
      </h1>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
              AI 모드 활성화
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              AI가 스토리, 이미지, 음성(TTS) 등 대부분의 요소를 자동으로
              생성하도록 합니다. 사용자가 설정한 값은 AI 생성 시 참고됩니다.
            </p>
          </div>
          <label
            htmlFor="ai-mode-toggle"
            className="flex items-center cursor-pointer select-none"
          >
            <div className="relative">
              <input
                type="checkbox"
                id="ai-mode-toggle"
                className="sr-only"
                checked={aiMode}
                onChange={handleAiModeToggle}
              />
              <div
                className={`block w-16 h-9 rounded-full transition-colors duration-200 ease-in-out ${
                  aiMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-7 h-7 rounded-full transition-transform duration-200 ease-in-out shadow-md transform ${
                  aiMode ? "translate-x-[calc(100%-0.25rem)]" : "translate-x-0"
                }`}
              ></div>
            </div>
            <span
              className={`ml-3 text-base font-medium ${
                aiMode ? "text-blue-600" : "text-slate-600"
              }`}
            >
              {aiMode ? "활성화됨" : "비활성화됨"}
            </span>
          </label>
        </div>
      </div>
      <div className="space-y-8 sm:space-y-10">
        <ContentsSettings
          contents={settings.contents}
          onSettingChange={(key, value) => setSetting("contents", key, value)} // 스토어 액션 직접 전달
        />
        <StorySettings
          story={settings.story}
          aiMode={aiMode} // aiMode는 여전히 UI 표시에 사용될 수 있음
          onSettingChange={(key, value) => setSetting("story", key, value)}
        />
        <ImageSettings
          image={settings.image}
          aiMode={aiMode}
          onSettingChange={(key, value) => setSetting("image", key, value)}
        />
        <VideoSettings
          video={settings.video}
          // aiMode는 VideoSettings에서 사용하지 않으므로 전달 안 함
          onSettingChange={(key, value) => setSetting("video", key, value)}
        />
        <TtsSettings
          tts={settings.tts}
          aiMode={aiMode}
          onSettingChange={(key, value) => setSetting("tts", key, value)}
        />
      </div>
      <div className="mt-12 flex flex-col items-center">
        <button
          onClick={handleSave}
          disabled={storeSaving} // 스토어의 저장 상태 사용
          className={`px-10 py-3.5 rounded-lg text-lg font-semibold text-white flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
            storeSaving
              ? "bg-blue-400 cursor-not-allowed focus:ring-blue-300"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl focus:ring-blue-500"
          }`}
        >
          {storeSaving ? (
            <>
              <Loader2 size={22} className="animate-spin mr-2.5" /> 저장 중...
            </>
          ) : (
            <>
              <Save size={20} className="mr-2.5" /> 설정 저장
            </>
          )}
        </button>
        {saveSuccessMessage && (
          <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
            <CheckCircle size={18} className="mr-1.5" />
            설정이 성공적으로 저장되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}
