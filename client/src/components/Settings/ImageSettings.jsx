// client/src/components/Settings/ImageSettings.jsx
import React, { useState } from "react";
import { ImageIcon, RefreshCw, DownloadCloud } from "lucide-react"; // 아이콘 추가

// 예시 화면 비율 옵션
const aspectRatioOptions = [
  { value: "9:16", label: "9:16 (세로)", width: 768, height: 1344 }, // Shorts, Reels, TikTok
  { value: "16:9", label: "16:9 (가로)", width: 1344, height: 768 },
  { value: "1:1", label: "1:1 (정방형)", width: 1024, height: 1024 },
  { value: "4:3", label: "4:3", width: 1024, height: 768 },
  { value: "3:4", label: "3:4", width: 768, height: 1024 },
];

// 예시 Leonardo AI Preset Styles (실제 API 값으로 대체 필요)
// Leonardo AI 문서: Platform Models, SDXL Preset Styles 등 참고
const stylePresetOptions = [
  { value: "NONE", label: "스타일 없음 (기본 모델)" },
  { value: "LEONARDO", label: "Leonardo" },
  { value: "CINEMATIC", label: "Cinematic" },
  { value: "CREATIVE", label: "Creative" },
  { value: "VIBRANT", label: "Vibrant" },
  { value: "PHOTOREAL", label: "PhotoReal" }, // PhotoReal v2 사용 시 sd_version 등 추가 파라미터 필요할 수 있음
  { value: "ANIME", label: "Anime" },
  { value: "3D_RENDER", label: "3D Render" },
  // ... 기타 사용 가능한 프리셋 스타일
];

export default function ImageSettings({ image, onSettingChange }) {
  const [customModels, setCustomModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const selectedAspectRatio =
    aspectRatioOptions.find((opt) => opt.value === image.aspectRatio) ||
    aspectRatioOptions[0];

  // 커스텀 모델 로드 함수 (예시)
  const fetchCustomModels = async () => {
    setIsLoadingModels(true);
    try {
      // 실제로는 백엔드 /api/train 또는 /api/leonardo-custom-models 엔드포인트 호출
      // const response = await fetch('/api/leonardo-custom-models');
      // const data = await response.json();
      // setCustomModels(data.models || []); // 응답 형식에 따라

      // 임시 목업 데이터
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCustomModels([
        { id: "model_abc123", name: "나의 학습 모델 A (캐릭터 특화)" },
        { id: "model_xyz789", name: "나의 학습 모델 B (배경 특화)" },
      ]);
    } catch (error) {
      console.error("커스텀 모델 로드 실패:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleAspectRatioSelect = (option) => {
    onSettingChange("aspectRatio", option.value);
    onSettingChange("width", option.width);
    onSettingChange("height", option.height);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center mb-6">
        <ImageIcon size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">이미지 설정</h2>
      </div>
      <div className="space-y-6">
        {/* 화면 비율 선택 */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            화면 비율 (클릭하여 선택)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {aspectRatioOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAspectRatioSelect(opt)}
                className={`
                  p-3 rounded-lg border-2 flex flex-col items-center justify-center aspect-[3/2] transition-all
                  ${
                    selectedAspectRatio.value === opt.value
                      ? "border-blue-500 ring-2 ring-blue-500 shadow-lg"
                      : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                  }
                  focus:outline-none
                `}
                title={`${opt.label} (${opt.width}x${opt.height})`}
              >
                <div
                  className={`w-10 h-10 bg-slate-300 rounded-sm mb-1.5 flex items-center justify-center text-slate-500 text-xs transform ${
                    opt.value === "9:16"
                      ? "scale-x-[0.5625]"
                      : opt.value === "16:9"
                      ? "scale-y-[0.5625]"
                      : opt.value === "4:3"
                      ? "scale-y-[0.75]"
                      : opt.value === "3:4"
                      ? "scale-x-[0.75]"
                      : ""
                  }`}
                >
                  {opt.label.split(" ")[0]}
                </div>
                <span
                  className={`text-xs font-medium ${
                    selectedAspectRatio.value === opt.value
                      ? "text-blue-600"
                      : "text-slate-700"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            선택된 크기: {image.width} x {image.height}
          </p>
        </div>

        {/* 스타일 프리셋 선택 */}
        <div>
          <label
            htmlFor="image-style-preset"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            스타일 프리셋 (Leonardo AI)
          </label>
          <select
            id="image-style-preset"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={image.stylePreset}
            onChange={(e) => onSettingChange("stylePreset", e.target.value)}
          >
            {stylePresetOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Leonardo AI의 다양한 사전 정의된 스타일을 선택합니다. '스타일
            없음'은 기본 모델을 사용합니다.
          </p>
        </div>

        {/* 커스텀 모델 선택 (옵셔널) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="custom-model-id"
              className="block text-sm font-medium text-slate-600"
            >
              커스텀 모델 (학습된 모델)
            </label>
            <button
              onClick={fetchCustomModels}
              disabled={isLoadingModels}
              className="text-xs text-blue-600 hover:underline flex items-center disabled:opacity-50"
            >
              {isLoadingModels ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <RefreshCw size={14} className="mr-1" />
              )}
              모델 목록 새로고침
            </button>
          </div>
          <select
            id="custom-model-id"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={image.customModelId || ""}
            onChange={(e) =>
              onSettingChange("customModelId", e.target.value || null)
            } // 선택 안 함 시 null
            disabled={isLoadingModels}
          >
            <option value="">커스텀 모델 사용 안 함</option>
            {customModels.length > 0 ? (
              customModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                사용 가능한 커스텀 모델 없음
              </option>
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Leonardo AI에 학습시킨 사용자의 커스텀 모델을 선택하여 이미지를
            생성할 수 있습니다. (예: 특정 캐릭터, 화풍)
          </p>
        </div>

        {/* Guidance Scale (프롬프트 충실도) */}
        <div>
          <label
            htmlFor="guidance-scale"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            프롬프트 충실도 (Guidance Scale): {image.guidanceScale}
          </label>
          <input
            type="range"
            id="guidance-scale"
            min="1"
            max="20"
            step="1"
            value={image.guidanceScale}
            onChange={(e) =>
              onSettingChange("guidanceScale", parseInt(e.target.value))
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            값이 높을수록 프롬프트를 더 엄격하게 따르지만, 낮을수록 AI의
            창의성이 높아집니다 (권장: 5-10).
          </p>
        </div>

        {/* 여기에 더 많은 Leonardo AI 옵션들을 추가할 수 있습니다. */}
        {/* 예: Negative Prompt, ControlNet 설정, Tiling 등 */}
        {/*
        <div>
          <label htmlFor="negative-prompt" className="block text-sm font-medium text-slate-600 mb-1">네거티브 프롬프트 (선택)</label>
          <textarea id="negative-prompt" rows="2" className="mt-1 block w-full ..."></textarea>
        </div>
        */}
      </div>
    </div>
  );
}
