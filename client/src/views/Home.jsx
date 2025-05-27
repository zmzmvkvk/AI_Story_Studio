// src/views/Home.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const [list, setList] = useState([
    { id: "abc123", title: "나의 첫 쇼츠" },
    { id: "def456", title: "AI 실험 프로젝트" },
  ]);
  const navigate = useNavigate();

  // + 클릭: 새 프로젝트 ID 생성 → 바로 Setting 페이지로 이동
  const handleCreate = () => {
    const newId = Date.now().toString();
    navigate(`/detail/${newId}/settings`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">내 프로젝트(Shorts)</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {list.map((item) => (
          <Link
            key={item.id}
            to={`/result/${item.id}`}
            className="block border rounded-xl bg-white shadow hover:shadow-lg transition p-6"
          >
            <div className="font-semibold text-lg mb-2">{item.title}</div>
            <div className="text-gray-400 text-sm">ID: {item.id}</div>
          </Link>
        ))}
        {/* + 카드 → 바로 Setting으로 */}
        <button
          onClick={handleCreate}
          className="flex items-center justify-center border-2 border-dashed border-blue-400 rounded-xl bg-white hover:bg-blue-50 transition p-6 text-blue-500 text-2xl font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
