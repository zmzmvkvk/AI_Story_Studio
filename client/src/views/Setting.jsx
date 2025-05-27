// src/views/Setting.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSettingStore } from "../store/useSettingStore";
import ProgressBar from "../components/UI/ProgressBar";

// Toggle Switch (커스텀 스타일)
function Toggle({ checked, onChange, label, color = "blue" }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`w-12 h-7 flex items-center bg-gray-200 rounded-full p-1 transition-colors duration-200
          ${checked ? `bg-${color}-500` : "bg-gray-300"}
        `}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition
            ${checked ? "translate-x-5" : ""}
          `}
        />
      </div>
      <span
        className={`ml-2 font-semibold ${
          checked ? `text-${color}-600` : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

// Select 박스
function Select({ value, onChange, options, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium w-24">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 py-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Setting() {
  const { id } = useParams();
  const {
    settings,
    setSettings,
    aiMode,
    setAiMode,
    fetchSettings,
    saveSettings,
  } = useSettingStore();

  // 최초 마운트 시 세팅 불러오기
  useEffect(() => {
    fetchSettings(id);
  }, [id]);

  // 각 세팅 핸들러
  const handleChange = (section, key, value) => {
    setSettings({
      ...settings,
      [section]: { ...settings[section], [key]: value },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <ProgressBar />
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-bold mb-4">설정</h2>

        {/* AI/수동 토글 */}
        <div className="mb-8">
          <Toggle
            checked={aiMode}
            onChange={setAiMode}
            label={aiMode ? "AI 자동화 사용" : "수동 편집"}
            color="blue"
          />
        </div>

        {/* Contents 옵션 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">콘텐츠 옵션</h3>
          <div className="flex gap-4">
            <Select
              value={settings.contents.platform}
              onChange={(v) => handleChange("contents", "platform", v)}
              label="플랫폼"
              options={[
                { label: "YouTube", value: "youtube" },
                { label: "Instagram", value: "instagram" },
              ]}
            />
            <Select
              value={settings.contents.type}
              onChange={(v) => handleChange("contents", "type", v)}
              label="유형"
              options={[
                { label: "Shorts", value: "shorts" },
                { label: "Reels", value: "reels" },
              ]}
            />
          </div>
        </div>

        {/* Story 옵션 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">스토리 옵션</h3>
          <div className="flex gap-4">
            <Select
              value={settings.story.language}
              onChange={(v) => handleChange("story", "language", v)}
              label="언어"
              options={[
                { label: "한국어", value: "ko" },
                { label: "영어", value: "en" },
              ]}
            />
            <input
              className="border rounded px-3 py-2"
              value={settings.story.mainCharacter}
              onChange={(e) =>
                handleChange("story", "mainCharacter", e.target.value)
              }
              placeholder="주인공 이름"
            />
          </div>
        </div>

        {/* Image 옵션 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">이미지 옵션</h3>
          <Select
            value={settings.image.style}
            onChange={(v) => handleChange("image", "style", v)}
            label="스타일"
            options={[
              { label: "Cartoon", value: "cartoon" },
              { label: "Photorealistic", value: "photo" },
              { label: "Anime", value: "anime" },
            ]}
          />
        </div>

        {/* Video 옵션 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">영상 옵션</h3>
          <div className="flex gap-4">
            <Select
              value={settings.video.resolution}
              onChange={(v) => handleChange("video", "resolution", v)}
              label="해상도"
              options={[
                { label: "1080p", value: "1080p" },
                { label: "720p", value: "720p" },
              ]}
            />
            <Select
              value={settings.video.fps}
              onChange={(v) => handleChange("video", "fps", v)}
              label="FPS"
              options={[
                { label: "30", value: 30 },
                { label: "60", value: 60 },
              ]}
            />
          </div>
        </div>

        {/* TTS 옵션 */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">TTS 옵션</h3>
          <div className="flex gap-4">
            <Select
              value={settings.tts.speaker}
              onChange={(v) => handleChange("tts", "speaker", v)}
              label="스피커"
              options={[
                { label: "여성", value: "female" },
                { label: "남성", value: "male" },
              ]}
            />
            <Select
              value={settings.tts.speed}
              onChange={(v) => handleChange("tts", "speed", Number(v))}
              label="속도"
              options={[
                { label: "1.0", value: 1.0 },
                { label: "1.2", value: 1.2 },
                { label: "0.8", value: 0.8 },
              ]}
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={() => saveSettings(id)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg shadow"
        >
          저장
        </button>
      </div>
    </div>
  );
}
