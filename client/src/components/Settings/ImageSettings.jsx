// src/components/Settings/ImageSettings.jsx
import React from "react";
import { ImageIcon } from "lucide-react"; // 아이콘 추가

export default function ImageSettings({ image, aiMode, onSettingChange }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      {" "}
      {/* 스타일 변경 */}
      <div className="flex items-center mb-6">
        <ImageIcon size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">이미지 설정</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="image-style"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            스타일
          </label>
          <select
            id="image-style"
            className={`mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm
              ${
                aiMode
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-white"
              }`} // 비활성 스타일 변경
            value={image.style}
            onChange={(e) => onSettingChange("style", e.target.value)}
            disabled={aiMode}
          >
            <option value="cartoon">카툰</option>
            <option value="realistic">실사</option>
            <option value="abstract">추상</option>
            <option value="pixelart">픽셀 아트</option>
            <option value="3d">3D 렌더</option>
          </select>
          {aiMode && (
            <p className="mt-2 text-xs text-slate-500">
              {" "}
              {/* 스타일 변경 */}
              AI 모드에서는 이미지 스타일을 직접 선택할 수 없습니다. AI가
              콘텐츠에 맞춰 최적의 스타일을 적용합니다.
            </p>
          )}
        </div>
        {/* 추가적인 이미지 설정들을 여기에 추가 */}
      </div>
    </div>
  );
}
