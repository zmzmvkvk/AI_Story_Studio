// src/views/Setting.jsx
// (기존 src/components/Settings/Setting.jsx을 src/views/Setting.jsx으로 이동 또는 간주)
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import { Loader2, CheckCircle, Save } from "lucide-react"; // lucide-react 아이콘으로 변경

import ContentsSettings from "../components/Settings/ContentsSettings";
import StorySettings from "../components/Settings/StorySettings";
import ImageSettings from "../components/Settings/ImageSettings";
import VideoSettings from "../components/Settings/VideoSettings"; // 추가
import TtsSettings from "../components/Settings/TtsSettings"; // 추가

export default function Setting() {
  const { id: projectId } = useParams();
  const {
    aiMode,
    settings,
    setAiMode,
    setSettings,
    fetchSettings,
    saveSettings,
  } = useSettingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      if (projectId) {
        // projectId가 유효할 때만 fetch
        await fetchSettings(projectId);
      }
      setIsLoading(false);
    };
    loadSettings();
  }, [projectId, fetchSettings]);

  const handleSettingChange = useCallback(
    (category, key, value) => {
      setSettings({
        ...settings,
        [category]: {
          ...settings[category],
          [key]: value,
        },
      });
    },
    [settings, setSettings]
  );

  const handleAiModeToggle = () => {
    setAiMode(!aiMode);
  };

  const handleSave = async () => {
    if (!projectId) return; // projectId가 없으면 저장 시도 안함
    setIsSaving(true);
    setSaveSuccess(false);
    await saveSettings(projectId);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-blue-600">
        {" "}
        {/* 높이 조정 및 색상 변경 */}
        <Loader2 size={48} className="animate-spin" />
        <span className="ml-3 text-xl mt-4">설정 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {" "}
      {/* 최대 너비 및 패딩 조정 */}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-10 text-center">
        {" "}
        {/* 색상 및 마진 변경 */}
        프로젝트 설정
      </h1>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 border border-slate-200">
        {" "}
        {/* 스타일 변경 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
              {" "}
              {/* 크기 및 색상 변경 */}
              AI 모드 활성화
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              AI가 스토리, 이미지, 음성(TTS) 등 대부분의 요소를 자동으로
              생성하도록 합니다.
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
                  // 크기 및 트랜지션 변경
                  aiMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-7 h-7 rounded-full transition-transform duration-200 ease-in-out shadow-md transform ${
                  // 크기, 그림자 및 트랜지션 변경
                  aiMode ? "translate-x-[calc(100%-0.25rem)]" : "translate-x-0" // 핸들 위치 정확하게
                }`}
              ></div>
            </div>
            <span
              className={`ml-3 text-base font-medium ${
                aiMode ? "text-blue-600" : "text-slate-600"
              }`}
            >
              {" "}
              {/* 텍스트 스타일 변경 */}
              {aiMode ? "활성화됨" : "비활성화됨"}
            </span>
          </label>
        </div>
      </div>
      <div className="space-y-8 sm:space-y-10">
        {" "}
        {/* 간격 조정 */}
        <ContentsSettings
          contents={settings.contents}
          onSettingChange={(key, value) =>
            handleSettingChange("contents", key, value)
          }
        />
        <StorySettings
          story={settings.story}
          aiMode={aiMode}
          onSettingChange={(key, value) =>
            handleSettingChange("story", key, value)
          }
        />
        <ImageSettings
          image={settings.image}
          aiMode={aiMode}
          onSettingChange={(key, value) =>
            handleSettingChange("image", key, value)
          }
        />
        <VideoSettings
          video={settings.video}
          onSettingChange={(key, value) =>
            handleSettingChange("video", key, value)
          }
        />
        <TtsSettings
          tts={settings.tts}
          aiMode={aiMode}
          onSettingChange={(key, value) =>
            handleSettingChange("tts", key, value)
          }
        />
      </div>
      <div className="mt-12 flex flex-col items-center">
        {" "}
        {/* 간격 조정 및 레이아웃 변경 */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-10 py-3.5 rounded-lg text-lg font-semibold text-white
            flex items-center justify-center
            transition-all duration-300 ease-in-out focus:outline-none focus:ring-4
            ${
              isSaving
                ? "bg-blue-400 cursor-not-allowed focus:ring-blue-300"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl focus:ring-blue-500"
            }
          `}
        >
          {isSaving ? (
            <>
              <Loader2 size={22} className="animate-spin mr-2.5" />{" "}
              {/* 아이콘 및 간격 변경 */}
              저장 중...
            </>
          ) : (
            <>
              <Save size={20} className="mr-2.5" /> {/* 아이콘 변경 */}
              설정 저장
            </>
          )}
        </button>
        {saveSuccess && (
          <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
            {" "}
            {/* 간격 및 스타일 변경 */}
            <CheckCircle size={18} className="mr-1.5" />{" "}
            {/* 아이콘 및 간격 변경 */}
            설정이 성공적으로 저장되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}
