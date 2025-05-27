// src/components/UI/ProgressBar.jsx
import { Link, useLocation, useParams } from "react-router-dom";

const STEPS = [
  { path: "settings", label: "설정" },
  { path: "story", label: "스토리" },
  { path: "image", label: "이미지" },
  { path: "video", label: "영상" },
  { path: "tts", label: "TTS" },
  { path: "edit", label: "영상편집" },
  { path: "result", label: "결과" },
];

export default function ProgressBar() {
  const { id } = useParams();
  const location = useLocation();

  // 현재 단계 path 추출
  const currentStep =
    STEPS.find((step) => location.pathname.includes(`/${step.path}`))?.path ||
    "settings";

  return (
    <div className="w-full flex flex-col items-center mb-10 select-none">
      <div className="mb-2 text-lg text-gray-500">
        프로젝트 ID:{" "}
        <Link
          to={`/settings/${id}`}
          className="text-blue-600 font-mono hover:underline"
        >
          {id}
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.path;
          return (
            <div className="flex items-center" key={step.path}>
              <Link
                to={`/${step.path}/${id}`}
                className={`
                  flex items-center justify-center
                  h-14 min-w-[64px] px-4
                  rounded-full text-base font-bold
                  transition
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                  }
                  ${step.label.length === 4 ? "text-lg" : "text-base"}
                `}
                style={{
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                  height: "56px",
                  minWidth: "72px",
                }}
              >
                {step.label}
              </Link>
              {/* 마지막 단계가 아니면 하이픈(-) 선 */}
              {idx < STEPS.length - 1 && (
                <div className="mx-1 text-2xl text-gray-300 font-bold select-none">
                  -
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
