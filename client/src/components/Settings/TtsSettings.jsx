// src/components/Settings/TtsSettings.jsx (새로 생성 또는 기존 파일 수정)
import React from "react";
import { Volume2 } from "lucide-react";

export default function TtsSettings({ tts, aiMode, onSettingChange }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center mb-6">
        <Volume2 size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">음성(TTS) 설정</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="tts-speaker"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            목소리 (스피커)
          </label>
          <select
            id="tts-speaker"
            className={`mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm ${
              aiMode
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-white"
            }`}
            value={tts.speaker}
            onChange={(e) => onSettingChange("speaker", e.target.value)}
            disabled={aiMode}
          >
            <option value="female">여성</option>
            <option value="male">남성</option>
            {/* 실제 TTS 서비스에 따라 다양한 목소리 옵션 추가 가능 */}
          </select>
        </div>
        <div>
          <label
            htmlFor="tts-speed"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            속도
          </label>
          <input
            type="number"
            id="tts-speed"
            min="0.5"
            max="2.0"
            step="0.1"
            className={`mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 ${
              aiMode
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-white"
            }`}
            value={tts.speed}
            onChange={(e) =>
              onSettingChange("speed", parseFloat(e.target.value))
            }
            disabled={aiMode}
          />
        </div>
        {aiMode && (
          <p className="md:col-span-2 mt-2 text-xs text-slate-500">
            AI 모드에서는 음성 스타일을 직접 선택할 수 없습니다. AI가 최적의
            목소리와 속도를 결정합니다.
          </p>
        )}
      </div>
    </div>
  );
}
