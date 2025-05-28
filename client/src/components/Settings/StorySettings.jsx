// src/components/Settings/StorySettings.jsx
import React from "react";
import { BookText } from "lucide-react"; // 아이콘 추가

export default function StorySettings({ story, aiMode, onSettingChange }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      {" "}
      {/* 스타일 변경 */}
      <div className="flex items-center mb-6">
        <BookText size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">스토리 설정</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="story-language"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            언어
          </label>
          <select
            id="story-language"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white" // 스타일 변경
            value={story.language}
            onChange={(e) => onSettingChange("language", e.target.value)}
          >
            <option value="ko">한국어</option>
            <option value="en">영어</option>
            <option value="ja">일본어</option>
            {/* 필요시 다른 언어 추가 */}
          </select>
        </div>
        <div>
          <label
            htmlFor="main-character"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            메인 캐릭터 (선택 사항)
          </label>
          <input
            type="text"
            id="main-character"
            className={`mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5  ${
              aiMode
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-white"
            }`} // 스타일 변경
            value={story.mainCharacter}
            onChange={(e) => onSettingChange("mainCharacter", e.target.value)}
            placeholder={
              aiMode ? "AI가 자동으로 생성 (필요 시)" : "예: 용감한 토끼 탐험가"
            }
            disabled={aiMode}
          />
          {aiMode && (
            <p className="mt-2 text-xs text-slate-500">
              {" "}
              {/* 스타일 변경 */}
              AI 모드에서는 메인 캐릭터를 직접 설정하지 않아도 됩니다. 필요시
              AI가 맥락에 맞게 생성합니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
