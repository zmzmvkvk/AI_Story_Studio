import { useState, useRef } from "react";
import { useStoryStore } from "../store/useStoryStore";
import { useSettingStore } from "../store/useSettingStore";

export default function Story() {
  const { aiMode, setAiMode } = useSettingStore();
  const {
    uploadedImage,
    setUploadedImage,
    story,
    setStory,
    addCutscene,
    updateStory,
    updateCutscene,
    removeCutscene,
    saveStory,
  } = useStoryStore();

  const [aiGenerating, setAiGenerating] = useState(false);
  const fileInputRef = useRef(null);

  // AI 컷씬 자동생성 버튼(예시: 실제 구현은 서버API 연동)
  const handleAIGenerate = async () => {
    setAiGenerating(true);
    // 서버에 이미지 업로드 + AI 분석 요청 (예시, 실제론 fetch/axios)
    setTimeout(() => {
      // 예시: AI가 컷씬 3개 만들어줬다고 가정
      setStory({
        ...story,
        cutscenes: [
          { sceneId: Date.now() + 1, title: "AI 컷씬 1", content: "" },
          { sceneId: Date.now() + 2, title: "AI 컷씬 2", content: "" },
          { sceneId: Date.now() + 3, title: "AI 컷씬 3", content: "" },
        ],
      });
      setAiGenerating(false);
    }, 1800);
  };

  // 파일 업로드 처리
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImage(file);
  };

  // 뷰 렌더
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">스토리 에디터</h2>

      {/* 1. AI/수동 전환 토글 */}
      <div className="mb-6 flex items-center gap-4">
        <span>작업 방식:</span>
        <button
          className={`px-4 py-2 rounded font-bold ${
            aiMode ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setAiMode(true)}
        >
          AI로 자동작성
        </button>
        <button
          className={`px-4 py-2 rounded font-bold ${
            !aiMode ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setAiMode(false)}
        >
          수동작성
        </button>
      </div>

      {/* 2. AI모드일 때 이미지 업로드 및 컷씬 자동생성 */}
      {aiMode && (
        <div className="mb-8 border rounded p-4 bg-gray-50">
          <div className="mb-2 font-semibold">상품 이미지 업로드</div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            className="mb-2"
          />
          {uploadedImage && (
            <div className="mb-2 text-gray-600">
              업로드된 파일: {uploadedImage.name}
            </div>
          )}
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleAIGenerate}
            disabled={aiGenerating || !uploadedImage}
          >
            {aiGenerating ? "AI 생성 중..." : "AI로 컷씬 자동 생성"}
          </button>
        </div>
      )}

      {/* 3. 스토리 제목/컷씬(수동·AI 모두 편집 가능) */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">스토리 제목</label>
        <input
          className="border p-2 w-full rounded"
          value={story?.title || ""}
          onChange={(e) => updateStory({ title: e.target.value })}
          placeholder="스토리 제목"
        />
      </div>

      <div className="mb-8">
        <label className="block font-semibold mb-2">컷씬(장면) 목록</label>
        {!aiMode && (
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() =>
              addCutscene({
                sceneId: Date.now(),
                title: "",
                content: "",
                imagePrompt: "",
              })
            }
          >
            + 컷씬 추가
          </button>
        )}
        <ul>
          {(story?.cutscenes || []).map((cut) => (
            <li
              key={cut.sceneId}
              className="flex items-center gap-2 mb-2 bg-white rounded shadow p-3"
            >
              <input
                className="border p-1 rounded flex-1"
                value={cut.title}
                onChange={(e) =>
                  updateCutscene(cut.sceneId, { title: e.target.value })
                }
                placeholder="컷씬 제목"
              />
              <button
                className="px-2 text-red-600 font-bold"
                onClick={() => removeCutscene(cut.sceneId)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. 저장 버튼 */}
      <button
        onClick={saveStory}
        className="px-6 py-2 bg-green-600 text-white font-semibold rounded"
      >
        저장
      </button>
    </div>
  );
}
