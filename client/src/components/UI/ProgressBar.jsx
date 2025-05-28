// src/components/UI/ProgressBar.jsx
// (DetailLayout의 일부로 사용되므로, 그에 맞게 스타일 조정)
import { Link, useParams } from "react-router-dom";
import { Bot } from "lucide-react"; // AI Studio 로고용 아이콘 예시

export default function ProgressBar() {
  const { id } = useParams();

  return (
    // DetailLayout의 사이드바 상단에 위치한다고 가정하고 스타일링
    // 기존 w-full, mb-10, mt-12 등은 DetailLayout에서 제어하므로 여기선 제거하거나 단순화
    <div className="flex flex-col items-center mb-8 select-none pt-2">
      {" "}
      {/* 상단 패딩 및 하단 마진 조정 */}
      <Link
        to="/"
        className="
          flex items-center justify-center
          font-extrabold tracking-tight text-blue-600 hover:text-blue-700 transition
          text-2xl sm:text-3xl 
        "
        style={{
          fontFamily: "'Montserrat', 'Poppins', 'Pretendard', sans-serif", // 폰트 스택 변경
          // textShadow: "0px 1px 8px rgba(44,116,255,0.15)", // 그림자 효과 조정
        }}
        title="홈으로 이동"
      >
        <Bot size={32} className="mr-2 text-blue-500" />{" "}
        {/* 로고 아이콘 추가 */}
        AI STUDIO
      </Link>
      <div className="text-xs sm:text-sm mt-2 text-slate-500 font-medium tracking-wide text-center">
        프로젝트 ID:{" "}
        <Link
          to={`/detail/${id}/settings`} // 프로젝트 설정으로 바로 이동하도록
          className="text-blue-600 font-mono hover:underline break-all"
          title="현재 프로젝트 설정으로 이동"
        >
          {id}
        </Link>
      </div>
    </div>
  );
}
