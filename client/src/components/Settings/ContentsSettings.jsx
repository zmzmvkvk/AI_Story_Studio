// src/components/Settings/ContentsSettings.jsx
import React from "react";
import { LayoutGrid } from "lucide-react"; // 아이콘 추가

export default function ContentsSettings({ contents, onSettingChange }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      {" "}
      {/* 스타일 변경: rounded-xl, shadow-lg, border */}
      <div className="flex items-center mb-6">
        {" "}
        {/* 제목 영역 레이아웃 변경 */}
        <LayoutGrid size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">콘텐츠 설정</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-slate-600 mb-1" // 색상 변경
          >
            플랫폼
          </label>
          <select
            id="platform"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white" // 스타일 변경: py-2.5, rounded-lg, shadow-sm
            value={contents.platform}
            onChange={(e) => onSettingChange("platform", e.target.value)}
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-600 mb-1" // 색상 변경
          >
            콘텐츠 유형
          </label>
          <select
            id="type"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white" // 스타일 변경
            value={contents.type}
            onChange={(e) => onSettingChange("type", e.target.value)}
          >
            <option value="shorts">Shorts / Reels</option>
            <option value="long-form">일반 영상 (Long-form)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
