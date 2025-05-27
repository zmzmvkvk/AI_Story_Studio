import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-4">
      {/* 기존 카드들(map 돌리기) */}
      {/* ... */}
      {/* 신규 생성 카드 */}
      <div
        onClick={() => navigate("/edit/new")}
        className="w-40 h-40 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100"
      >
        <span className="text-4xl font-bold">+</span>
      </div>
    </div>
  );
}
