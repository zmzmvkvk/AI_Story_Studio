// client/src/components/Settings/ImageSettings.jsx
import React, { useState, useEffect } from "react";
import { ImageIcon, RefreshCw, Info, LoaderCircle } from "lucide-react"; // LoaderCircle로 변경

// ... (aspectRatioOptions, stylePresetOptions, schedulerOptions, sdVersionOptions 정의는 이전과 동일) ...
const aspectRatioOptions = [
  { value: "9:16", label: "9:16 (세로)", width: 768, height: 1344 },
  { value: "16:9", label: "16:9 (가로)", width: 1344, height: 768 },
  { value: "1:1", label: "1:1 (정방형)", width: 1024, height: 1024 },
  { value: "4:3", label: "4:3", width: 1024, height: 768 },
  { value: "3:4", label: "3:4", width: 768, height: 1024 },
];

const stylePresetOptions = [
  { value: "NONE", label: "스타일 없음 (모델 기본)" },
  { value: "LEONARDO", label: "Leonardo" },
  { value: "CINEMATIC", label: "Cinematic" },
  { value: "CREATIVE", label: "Creative" },
  { value: "DYNAMIC", label: "Dynamic" },
  { value: "ENVIRONMENT", label: "Environment" },
  { value: "GENERAL", label: "General" },
  { value: "ILLUSTRATION", label: "Illustration" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "RAYTRACED", label: "Raytraced" },
  { value: "RENDER_3D", label: "3D Render" },
  { value: "SKETCH_BW", label: "Sketch B&W" },
  { value: "SKETCH_COLOR", label: "Sketch Color" },
  { value: "VIBRANT", label: "Vibrant" },
  { value: "ANIME", label: "Anime" },
  { value: "BOKEH", label: "Bokeh" },
  { value: "CINEMATIC_CLOSEUP", label: "Cinematic Closeup" },
  { value: "FASHION", label: "Fashion" },
  { value: "FILM", label: "Film" },
  { value: "FOOD", label: "Food" },
  { value: "HDR", label: "HDR" },
  { value: "LONG_EXPOSURE", label: "Long Exposure" },
  { value: "MACRO", label: "Macro" },
  { value: "MINIMALISTIC", label: "Minimalistic" },
  { value: "MONOCHROME", label: "Monochrome" },
  { value: "MOODY", label: "Moody" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "PORTRAIT", label: "Portrait" },
  { value: "RETRO", label: "Retro" },
  { value: "STOCK_PHOTO", label: "Stock Photo" },
  { value: "UNPROCESSED", label: "Unprocessed (RAW Mode와 유사)" },
];

const schedulerOptions = [
  { value: "EULER_DISCRETE", label: "Euler Discrete (기본값)" },
  { value: "KLMS", label: "KLMS" },
  { value: "EULER_ANCESTRAL_DISCRETE", label: "Euler Ancestral Discrete" },
  { value: "DDIM", label: "DDIM" },
  { value: "DPM_SOLVER", label: "DPM Solver" },
  { value: "PNDM", label: "PNDM" },
  { value: "LEONARDO", label: "Leonardo Scheduler" },
];

const sdVersionOptions = [
  { value: "SDXL_1_0", label: "SDXL 1.0 (기본값)" },
  { value: "v1_5", label: "Stable Diffusion 1.5" },
  { value: "v2", label: "Stable Diffusion 2.1" },
  { value: "v3", label: "Stable Diffusion 3 (지원 시)" },
  { value: "SDXL_LIGHTNING", label: "SDXL Lightning" },
  { value: "PHOENIX", label: "Phoenix" },
  { value: "FLUX", label: "Flux" },
];

export default function ImageSettings({ image, onSettingChange }) {
  // aiMode prop은 여기서는 직접 사용하지 않음
  const [customModels, setCustomModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const selectedAspectRatio =
    aspectRatioOptions.find((opt) => opt.value === image.aspectRatio) ||
    aspectRatioOptions[0];

  const fetchCustomModels = async () => {
    setIsLoadingModels(true);
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
      const response = await fetch(`${apiBaseUrl}/user-models`);
      if (!response.ok) throw new Error("커스텀 모델 로드 API 오류");
      const data = await response.json();
      setCustomModels(data.models || []);
    } catch (error) {
      console.error("커스텀 모델 로드 실패:", error);
      setCustomModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchCustomModels();
  }, []);

  const handleAspectRatioSelect = (option) => {
    onSettingChange("aspectRatio", option.value);
    onSettingChange("width", option.width);
    onSettingChange("height", option.height);
  };

  // 토글 스위치 값 변경 핸들러
  const handleToggleChange = (key) => {
    onSettingChange(key, !image[key]); // 해당 키의 boolean 값을 반전시켜 업데이트
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center mb-6">
        <ImageIcon size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">
          이미지 상세 설정
        </h2>
      </div>
      <div className="space-y-8">
        {/* 화면 비율 */}
        <div className="border-b pb-6 mb-6">
          {/* ... (이전과 동일) ... */}
          <label className="block text-sm font-medium text-slate-600 mb-2">
            화면 비율 (클릭하여 선택)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {aspectRatioOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAspectRatioSelect(opt)}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center aspect-[3/2] transition-all ${
                  selectedAspectRatio.value === opt.value
                    ? "border-blue-500 ring-2 ring-blue-500 shadow-lg"
                    : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                } focus:outline-none`}
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
          <p className="mt-2 text-xs text-slate-500">
            선택된 크기: {image.width} x {image.height}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {/* 스타일 프리셋 */}
          <div>
            <label
              htmlFor="image-style-preset"
              className="block text-sm font-medium text-slate-600 mb-1"
            >
              스타일 프리셋 (Leonardo AI)
            </label>
            <select
              id="image-style-preset"
              className="mt-1 block w-full default-input-style"
              value={image.stylePreset || "NONE"}
              onChange={(e) => onSettingChange("stylePreset", e.target.value)}
            >
              {stylePresetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 커스텀 모델 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="custom-model-id"
                className="block text-sm font-medium text-slate-600"
              >
                커스텀 모델 (Finetuned)
              </label>
              <button
                onClick={fetchCustomModels}
                disabled={isLoadingModels}
                className="text-xs text-blue-600 hover:underline flex items-center disabled:opacity-50"
              >
                {isLoadingModels ? (
                  <LoaderCircle size={14} className="animate-spin mr-1" />
                ) : (
                  <RefreshCw size={14} className="mr-1" />
                )}
                목록 새로고침
              </button>
            </div>
            <select
              id="custom-model-id"
              className="mt-1 block w-full default-input-style"
              value={image.customModelId || ""}
              onChange={(e) =>
                onSettingChange("customModelId", e.target.value || null)
              }
              disabled={isLoadingModels}
            >
              <option value="">커스텀 모델 사용 안 함</option>
              {customModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* SD Version (커스텀 모델 미사용 시) */}
          {!image.customModelId && (
            <div>
              <label
                htmlFor="sd-version"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Stable Diffusion 버전 (모델 미지정 시)
              </label>
              <select
                id="sd-version"
                className="mt-1 block w-full default-input-style"
                value={image.sd_version || "SDXL_1_0"}
                onChange={(e) => onSettingChange("sd_version", e.target.value)}
              >
                {sdVersionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 이미지 개수 */}
          <div>
            <label
              htmlFor="num_images"
              className="block text-sm font-medium text-slate-600 mb-1"
            >
              생성 이미지 수: {image.num_images}
            </label>
            <input
              type="range"
              id="num_images"
              min="1"
              max="8"
              step="1"
              value={image.num_images || 1}
              onChange={(e) =>
                onSettingChange("num_images", parseInt(e.target.value))
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Guidance Scale */}
          <div>
            <label
              htmlFor="guidance-scale"
              className="block text-sm font-medium text-slate-600 mb-1"
            >
              프롬프트 충실도: {image.guidanceScale}
            </label>
            <input
              type="range"
              id="guidance-scale"
              min="1"
              max="20"
              step="1"
              value={image.guidanceScale || 7}
              onChange={(e) =>
                onSettingChange("guidanceScale", parseInt(e.target.value))
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Scheduler */}
          <div>
            <label
              htmlFor="scheduler"
              className="block text-sm font-medium text-slate-600 mb-1"
            >
              스케줄러
            </label>
            <select
              id="scheduler"
              className="mt-1 block w-full default-input-style"
              value={image.scheduler || "EULER_DISCRETE"}
              onChange={(e) => onSettingChange("scheduler", e.target.value)}
            >
              {schedulerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 네거티브 프롬프트 */}
        <div className="border-t pt-6 mt-6">
          <label
            htmlFor="negative-prompt"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            네거티브 프롬프트 (제외할 요소)
          </label>
          <textarea
            id="negative-prompt"
            rows="2"
            className="mt-1 block w-full default-input-style resize-none"
            placeholder="예: blurry, ugly, text, watermark, low quality"
            value={image.negative_prompt || ""}
            onChange={(e) => onSettingChange("negative_prompt", e.target.value)}
          ></textarea>
        </div>

        {/* 고급 옵션 토글 (Alchemy, PhotoReal, PromptMagic, enhancePrompt) */}
        <div className="border-t pt-6 mt-6 space-y-4">
          <h3 className="text-md font-semibold text-slate-700 mb-2">
            고급 생성 옵션
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {" "}
            {/* md:grid-cols-3 제거 */}
            {[
              {
                key: "alchemy",
                label: "Alchemy 사용",
                help: "고품질 이미지 생성 (V1은 PhotoReal, PromptMagic 포함 가능. V2는 다를 수 있음)",
              },
              {
                key: "photoReal",
                label: "PhotoReal 모드",
                help: "실사 이미지 강화 (Alchemy와 함께 사용되거나 독립 옵션일 수 있음. API 버전 확인)",
              },
              {
                key: "promptMagic",
                label: "Prompt Magic",
                help: "프롬프트 자동 개선/확장 (Alchemy와 함께 사용되거나 독립 옵션일 수 있음)",
              },
              {
                key: "enhancePrompt",
                label: "프롬프트 개선 (별도 API)",
                help: "입력 프롬프트를 Leonardo AI가 자체적으로 개선 (위 Prompt Magic과 중복 사용 주의)",
              },
            ].map((opt) => (
              <div
                key={opt.key}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
              >
                <label
                  htmlFor={opt.key}
                  className="text-sm font-medium text-slate-700 flex items-center"
                >
                  {opt.label}
                  <Info
                    size={14}
                    className="ml-1.5 text-slate-400 cursor-help"
                    title={opt.help}
                  />
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name={opt.key}
                    id={opt.key}
                    checked={!!image[opt.key]} // 스토어의 boolean 값과 바인딩
                    onChange={() => handleToggleChange(opt.key)} // 수정된 핸들러 사용
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor={opt.key}
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            ))}
          </div>
          {image.enhancePrompt && ( // enhancePrompt가 true일 때만 지시사항 입력 필드 표시
            <div className="mt-4">
              <label
                htmlFor="enhancePromptInstructions"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                프롬프트 개선 지시사항 (선택)
              </label>
              <input
                type="text"
                id="enhancePromptInstructions"
                className="mt-1 block w-full default-input-style"
                placeholder="예: 우주 테마로 변경, 더 어둡고 신비롭게"
                value={image.enhancePromptInstructions || ""}
                onChange={(e) =>
                  onSettingChange("enhancePromptInstructions", e.target.value)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
