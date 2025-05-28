// src/views/Home.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useShortsListStore } from "../store/useShortsListStore";
import ProjectCard from "../components/UI/ProjectCard"; // 수정된 ProjectCard 사용
import {
  PlusCircle,
  Search,
  AlertTriangle,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react"; // lucide-react 아이콘

// SweetAlert2 대신 window.confirm 및 간단한 알림 사용
// import Swal from "sweetalert2"; // 제거

export default function Home() {
  const navigate = useNavigate();
  const {
    list,
    fetchList,
    addShorts,
    removeShorts,
    updateShorts,
    loading, // 스토어의 로딩 상태 사용
    error,
  } = useShortsListStore();

  const [isCreating, setIsCreating] = useState(false); // 새 프로젝트 생성 중 상태
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 프로젝트 ID
  const [titleValue, setTitleValue] = useState(""); // 수정 중인 제목의 임시 값
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (error) {
      // 간단한 알림으로 변경
      alert(`오류 발생: 프로젝트 목록을 불러오는 데 실패했습니다: ${error}`);
    }
  }, [error]);

  const handleCreateProject = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const newId = Date.now().toString();
      // lastStep은 초기 설정이므로 'settings'로 지정
      await addShorts(newId, {
        title: "새로운 스토리",
        lastStep: "settings",
        createdAt: Date.now(),
      }); // 여기서 Date.now()로 createdAt 전달
      navigate(`/detail/${newId}/settings`);
    } catch (err) {
      alert(`새 프로젝트 생성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTitleEdit = async (id, newTitle) => {
    if (!newTitle.trim()) {
      alert("제목은 비워둘 수 없습니다.");
      // 원래 제목으로 복원 또는 입력 필드 유지 (여기서는 편집 모드만 종료)
      setEditingId(null);
      return;
    }
    try {
      await updateShorts(id, { title: newTitle });
      setEditingId(null); // 편집 모드 종료
    } catch (err) {
      alert(`제목 수정 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (
      window.confirm(
        `'${title}' 프로젝트를 정말 삭제하시겠습니까?\n삭제된 프로젝트는 복구할 수 없습니다.`
      )
    ) {
      try {
        await removeShorts(id);
        alert("프로젝트가 성공적으로 삭제되었습니다.");
      } catch (err) {
        alert(`프로젝트 삭제 중 오류가 발생했습니다: ${err.message}`);
      }
    }
  };

  const handleCardClick = (item) => {
    // ProjectCard 내부에서 input 클릭 등으로 이벤트 버블링이 발생하지 않도록 ProjectCard에서 stopPropagation 처리
    // 여기서는 editingId와 일치하지 않을 때만 네비게이션
    if (editingId === item.id) return;

    const lastStep = item.lastStep || "settings";
    navigate(`/detail/${item.id}/${lastStep}`);
  };

  const filteredProjects = list.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const skeletonCount =
    loading && list.length === 0 ? 5 : loading ? list.length : 0; // 첫 로딩 시 5개, 이후엔 기존 개수만큼

  // NewProjectCard 컴포넌트 (Home.jsx 내부에 정의 또는 별도 파일로 분리 가능)
  const NewProjectCardView = () => (
    <button
      onClick={handleCreateProject}
      disabled={isCreating}
      className={`
        col-span-1 bg-slate-50 border-2 border-dashed border-blue-400 rounded-xl
        flex flex-col items-center justify-center
        text-blue-500 hover:bg-blue-100 hover:border-blue-500 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        min-h-[280px] aspect-w-1 aspect-h-1 
        ${isCreating ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {isCreating ? (
        <>
          <Loader2 size={48} className="animate-spin mb-3" />
          <span className="text-lg font-semibold">생성 중...</span>
        </>
      ) : (
        <>
          <PlusCircle size={48} className="mb-3" />
          <span className="text-lg font-semibold">새 스토리 만들기</span>
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
          AI Story Studio
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          나만의 스토리를 AI와 함께 쉽고 빠르게 만들어보세요.
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-10 px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        {loading && skeletonCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
            {[...Array(skeletonCount)].map((_, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-xl animate-pulse min-h-[280px]"
              >
                <div className="w-full h-40 sm:h-48 bg-slate-200 rounded-t-xl"></div>
                <div className="p-5">
                  <div className="w-3/4 h-5 bg-slate-200 rounded mb-3"></div>
                  <div className="w-1/2 h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
            {/* NewProjectCard 스켈레톤은 별도로 두거나, 로딩 시에는 숨길 수 있음. 여기서는 포함하지 않음. */}
          </div>
        ) : filteredProjects.length > 0 || isCreating ? ( // isCreating일 때도 그리드 유지
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
            <NewProjectCardView />
            {filteredProjects.map((item) => (
              <ProjectCard
                key={item.id}
                project={{
                  ...item,
                  // ProjectCard 내부에서 편집 상태를 관리하지 않고, Home.jsx의 상태를 전달
                  isEditing: editingId === item.id,
                  titleValue: editingId === item.id ? titleValue : item.title,
                  setTitleValue: setTitleValue,
                  setEditingId: setEditingId,
                  handleTitleEdit: handleTitleEdit, // Home.jsx의 함수 전달
                  handleDelete: handleDeleteProject, // Home.jsx의 함수 전달
                }}
                onClick={() => handleCardClick(item)}
                // onEditTitle, onDelete는 project 객체 내부 함수로 전달됨
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-xl text-slate-600">
              {searchTerm
                ? `'${searchTerm}'에 대한 검색 결과가 없습니다.`
                : "아직 생성된 프로젝트가 없습니다."}
            </p>
            <div className="mt-8">
              <NewProjectCardView />
            </div>
          </div>
        )}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} AI Story Studio. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
