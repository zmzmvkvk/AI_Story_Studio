// client/src/components/Settings/ContentsSettings.jsx
import React from "react";
import { LayoutGrid } from "lucide-react";

export default function ContentsSettings({ contents, onSettingChange }) {
  const platformOptions = [
    { value: "youtube", label: "YouTube" },
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center mb-6">
        <LayoutGrid size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">콘텐츠 설정</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            플랫폼
          </label>
          <select
            id="platform"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={contents.platform}
            onChange={(e) => onSettingChange("platform", e.target.value)}
          >
            {platformOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            콘텐츠 유형 (자동 선택)
          </label>
          <input
            type="text"
            id="type"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 bg-slate-100 sm:text-sm rounded-lg shadow-sm cursor-not-allowed"
            value={contents.type} // 스토어의 contents.type을 직접 사용
            readOnly
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        선택한 플랫폼에 따라 권장되는 스토리 길이(
        {contents.platformLengthDescription})와 컷 수(약{" "}
        {contents.platformDefaultCuts}컷)가 AI 스토리 생성 시 고려됩니다.
      </p>
    </div>
  );
}
