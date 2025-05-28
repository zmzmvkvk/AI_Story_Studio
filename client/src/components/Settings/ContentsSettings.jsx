// client/src/components/Settings/ContentsSettings.jsx
import React, { useEffect } from "react";
import { LayoutGrid } from "lucide-react";

export default function ContentsSettings({ contents, onSettingChange }) {
  const platformOptions = [
    { value: "youtube", label: "YouTube" },
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
  ];

  // 플랫폼에 따른 콘텐츠 유형 자동 설정 (예시)
  useEffect(() => {
    let newType = "shorts"; // 기본값
    // let videoLengthCategory = "short"; // <60s
    // let targetLength = 58;
    // let approximateCuts = 29;

    if (contents.platform === "youtube") {
      newType = "shorts";
      // targetLength = 58; approximateCuts = 29; videoLengthCategory = "short";
    } else if (contents.platform === "instagram") {
      newType = "reels";
      // targetLength = 88; approximateCuts = 29; videoLengthCategory = "medium"; // 60초 이상
    } else if (contents.platform === "tiktok") {
      newType = "tiktok";
      // targetLength = 88; approximateCuts = 35; videoLengthCategory = "medium"; // 60초 초과
    }
    onSettingChange("type", newType);
    // onSettingChange("videoLength", videoLengthCategory); // GPT 프롬프트용
    // onSettingChange("targetLengthInSeconds", targetLength);
    // onSettingChange("approximateCuts", approximateCuts);
  }, [contents.platform, onSettingChange]);

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
            콘텐츠 유형 (플랫폼에 따라 자동 선택됨)
          </label>
          <input
            type="text"
            id="type"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 bg-slate-100 sm:text-sm rounded-lg shadow-sm cursor-not-allowed"
            value={contents.type}
            readOnly // 자동 설정되므로 읽기 전용
          />
          {/* 사용자가 직접 길이/컷수를 조절하게 하려면 여기에 input 추가 */}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        선택한 플랫폼에 따라 권장되는 스토리 길이와 컷 수가 AI 스토리 생성 시
        고려됩니다. (YouTube Shorts: 60초 미만, Instagram Reels: 60초 이상,
        TikTok: 60초 초과)
      </p>
    </div>
  );
}
