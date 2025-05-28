// src/components/Layout/DetailLayout.jsx
import React from "react";
import { useParams, useLocation, useNavigate, Outlet } from "react-router-dom";
import ProgressBar from "../UI/ProgressBar"; // 수정된 ProgressBar 임포트

// lucide-react 아이콘으로 변경
import {
  Home,
  Settings,
  BookText, // BookOpen에서 변경 (좀 더 텍스트 느낌)
  ImageIcon, // PhotoIcon에서 변경
  Volume2, // SpeakerWaveIcon에서 변경
  Film, // VideoCameraIcon에서 변경
  Sparkles, // SparklesIcon 유지
  Share2, // ShareIcon에서 변경
  ChevronLeft, // 뒤로가기 또는 홈으로 가기용
} from "lucide-react";

const steps = [
  { id: "settings", name: "프로젝트 설정", icon: Settings, path: "settings" },
  { id: "story", name: "스토리 편집", icon: BookText, path: "story" },
  { id: "image", name: "이미지 생성", icon: ImageIcon, path: "image" },
  { id: "tts", name: "음성 (TTS)", icon: Volume2, path: "tts" },
  { id: "video", name: "비디오 설정", icon: Film, path: "video" },
  { id: "edit", name: "최종 편집", icon: Sparkles, path: "edit" },
  { id: "result", name: "완성 및 공유", icon: Share2, path: "result" },
];

export default function DetailLayout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 경로에서 마지막 부분을 stepId로 사용
  // 예: /detail/project123/story -> currentStepId는 'story'
  const currentStepId = location.pathname.split("/").filter(Boolean).pop();

  const handleStepClick = (stepPath) => {
    navigate(`/detail/${id}/${stepPath}`);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl flex flex-col p-5 border-r border-slate-200">
        {" "}
        {/* 너비 및 패딩 조정 */}
        {/* ProgressBar (AI Studio 로고 및 프로젝트 ID) - 사이드바 상단으로 이동 */}
        <ProgressBar />
        <nav className="flex-grow mt-6">
          {" "}
          {/* ProgressBar와의 간격 추가 */}
          <ul className="space-y-2">
            {" "}
            {/* 아이템 간 간격 조정 */}
            {steps.map((step) => (
              <li key={step.id}>
                <button
                  onClick={() => handleStepClick(step.path)}
                  className={`
                    flex items-center w-full py-3 px-4 rounded-lg text-base font-medium group
                    transition-all duration-200 ease-in-out
                    ${
                      currentStepId === step.id // 또는 step.path로 비교
                        ? "bg-blue-600 text-white shadow-md scale-105" // 활성 상태 스타일 강화
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:shadow-sm"
                    }
                  `}
                >
                  <step.icon
                    className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                      currentStepId === step.id
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-500"
                    }`}
                  />
                  {step.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* 홈으로 가기 버튼 및 저작권 */}
        <div className="mt-auto pt-6 border-t border-slate-200">
          <button
            onClick={handleGoHome}
            className="flex items-center w-full py-3 px-4 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200 group"
          >
            <ChevronLeft className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-500" />
            홈으로 돌아가기
          </button>
          <p className="text-center text-slate-400 text-xs mt-4">
            © {new Date().getFullYear()} AI Story Studio
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto bg-slate-50">
        {" "}
        {/* 배경색 및 패딩 조정 */}
        <Outlet />
      </main>
    </div>
  );
}
