// client/src/components/Settings/StorySettings.jsx
import React from "react";
import { BookText, UserCircle } from "lucide-react"; // UserCircle 아이콘 추가

// 예시 캐릭터 데이터 (실제로는 DB나 다른 곳에서 가져올 수 있음)
const predefinedCharacters = [
  {
    id: "default",
    name: "기본 (AI 자유 선택)",
    imageUrl: "/gfm_014x.png",
  }, // 기본값
  { id: "char_gphoman", name: "지포맨", imageUrl: "/gfm_014x.png" }, // 실제 이미지 경로로 수정
  { id: "char_idk", name: "아이디뭐", imageUrl: "/cfx_9zq0.png" },
  { id: "char_ramis", name: "라미스", imageUrl: "/spy_bx72.png" },
];

const storyDirectionOptions = [
  { value: "advertisement", label: "광고 / 홍보" },
  { value: "comedy", label: "코미디 / 병맛" },
  { value: "omnibus", label: "옴니버스" },
  { value: "drama", label: "드라마 / 감동" },
  { value: "thriller", label: "스릴러 / 미스터리" },
  { value: "educational", label: "정보 / 교육" },
  { value: "daily_life", label: "일상 / 브이로그" },
];

export default function StorySettings({ story, onSettingChange }) {
  const selectedCharacter =
    predefinedCharacters.find((c) => c.id === story.mainCharacter?.id) ||
    predefinedCharacters[0];

  const handleCharacterSelect = (character) => {
    onSettingChange("mainCharacter", {
      // 객체로 저장
      id: character.id,
      name: character.name,
      imageUrl: character.imageUrl,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center mb-6">
        <BookText size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">스토리 설정</h2>
      </div>
      <div className="space-y-6">
        {/* 언어 설정 */}
        <div>
          <label
            htmlFor="story-language"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            언어
          </label>
          <select /* ... 이전과 동일 ... */
            id="story-language"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={story.language}
            onChange={(e) => onSettingChange("language", e.target.value)}
          >
            <option value="ko">한국어</option>
            <option value="en">영어</option>
            <option value="ja">일본어</option>
          </select>
        </div>

        {/* 메인 캐릭터 선택 (이미지 클릭 방식) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            메인 캐릭터
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {predefinedCharacters.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => handleCharacterSelect(char)}
                className={`
                  p-2 rounded-lg border-2 flex flex-col items-center transition-all
                  ${
                    selectedCharacter.id === char.id
                      ? "border-blue-500 ring-2 ring-blue-500 shadow-lg scale-105"
                      : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                  }
                  focus:outline-none
                `}
                title={char.name}
              >
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  className="w-16 h-16 rounded-full object-cover mb-1.5"
                  onError={(e) => (e.target.src = "/placeholder-avatar.png")}
                />
                <span
                  className={`text-xs font-medium truncate ${
                    selectedCharacter.id === char.id
                      ? "text-blue-600"
                      : "text-slate-700"
                  }`}
                >
                  {char.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 스토리 방향 선택 */}
        <div>
          <label
            htmlFor="story-direction"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            스토리 방향
          </label>
          <select
            id="story-direction"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={story.storyDirection}
            onChange={(e) => onSettingChange("storyDirection", e.target.value)}
          >
            {storyDirectionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
