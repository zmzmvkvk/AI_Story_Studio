// client/src/views/Setting.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { LoaderCircle, CheckCircle, Save } from "lucide-react";

import ContentsSettings from "../components/Settings/ContentsSettings";
import StorySettings from "../components/Settings/StorySettings";
import ImageSettings from "../components/Settings/ImageSettings";
import VideoSettings from "../components/Settings/VideoSettings";
import TtsSettings from "../components/Settings/TtsSettings";

export default function Setting() {
  const { id: projectId } = useParams();
  const {
    aiMode,
    settings,
    setAiMode,
    setSetting,
    fetchSettings,
    saveSettings,
    loading: storeLoading,
    saving: storeSaving,
  } = useSettingStore();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsPageLoading(true);
      if (projectId) {
        await fetchSettings(projectId);
      }
      setIsPageLoading(false);
    };
    loadSettings();
  }, [projectId, fetchSettings]);

  const handleAiModeToggle = () => setAiMode(!aiMode);

  const handleSave = async () => {
    if (!projectId) return;
    setSaveSuccessMessage(false);
    try {
      await saveSettings(projectId);
      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 2500);
    } catch (error) {
      console.error("Save settings failed from component:", error);
    }
  };

  if (isPageLoading || storeLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-blue-600">
        <LoaderCircle size={48} className="animate-spin" />
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
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
              AI 어시스턴트 모드
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              활성화 시, AI가 콘텐츠 생성에 적극적으로 참여합니다.
              <br />
              사용자가 설정한 값은 AI 생성 시 참고됩니다.
            </p>
          </div>
          <label
            htmlFor="ai-mode-toggle-switch"
            className="flex items-center cursor-pointer mt-4 sm:mt-0"
          >
            <div className="relative">
              <input
                type="checkbox"
                id="ai-mode-toggle-switch"
                className="sr-only peer"
                checked={aiMode}
                onChange={handleAiModeToggle}
              />
              <div className="block bg-slate-300 peer-checked:bg-blue-600 w-14 h-8 rounded-full transition-colors duration-300"></div>
              <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 peer-checked:translate-x-full peer-checked:border-white shadow-md"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700">
              {aiMode ? "AI 모드 활성" : "AI 모드 비활성"}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-8 sm:space-y-10">
        <ContentsSettings
          contents={settings.contents}
          onSettingChange={(key, value) => setSetting("contents", key, value)}
        />
        <StorySettings
          story={settings.story}
          aiMode={aiMode}
          onSettingChange={(key, value) => setSetting("story", key, value)}
        />
        <ImageSettings
          image={settings.image}
          aiMode={aiMode}
          onSettingChange={(key, value) => setSetting("image", key, value)}
        />
        <VideoSettings
          video={settings.video}
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
          disabled={storeSaving}
          className={`px-10 py-3.5 rounded-lg text-lg font-semibold text-white flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
            storeSaving
              ? "bg-blue-400 cursor-not-allowed focus:ring-blue-300"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl focus:ring-blue-500"
          }`}
        >
          {storeSaving ? (
            <>
              <LoaderCircle size={22} className="animate-spin mr-2.5" /> 저장
              중...
            </>
          ) : (
            <>
              <Save size={20} className="mr-2.5" /> 설정 저장
            </>
          )}
        </button>
        {saveSuccessMessage && (
          <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
            <CheckCircle size={18} className="mr-1.5" /> 설정이 성공적으로
            저장되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}
