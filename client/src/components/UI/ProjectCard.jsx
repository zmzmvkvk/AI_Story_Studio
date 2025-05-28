// src/components/UI/ProjectCard.jsx
import { Edit3, Trash2 } from "lucide-react";

export default function ProjectCard({ project, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl group relative cursor-pointer"
    >
      <div className="w-full h-40 sm:h-48 bg-slate-200">
        <img
          src={
            project.thumbnail ||
            `https://placehold.co/600x400/e0e0e0/757575?text=${encodeURIComponent(
              project.title
            )}`
          }
          alt={`${project.title} 썸네일`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/600x400/e0e0e0/757575?text=이미지X`;
          }}
        />
      </div>
      <div className="p-5">
        {project.isEditing ? (
          <input
            type="text"
            value={project.titleValue}
            onChange={(e) => project.setTitleValue(e.target.value)}
            onBlur={(e) => {
              e.stopPropagation();
              project.handleTitleEdit(project.id, project.titleValue);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                project.handleTitleEdit(project.id, project.titleValue);
                e.target.blur();
              }
            }}
            className="w-full text-lg font-semibold text-slate-800 border-b-2 border-blue-500 focus:outline-none mb-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="text-lg font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              project.setEditingId(project.id);
              project.setTitleValue(project.title);
            }}
            title="제목 수정"
          >
            {project.title}
            <Edit3
              size={16}
              className="ml-2 text-slate-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </h3>
        )}
        {/* ... (마지막 작업, 생성일 렌더링 부분은 동일) ... */}
        <p className="text-xs text-slate-500 mt-1">
          마지막 작업:{" "}
          {project.lastStep
            ? project.lastStep.charAt(0).toUpperCase() +
              project.lastStep.slice(1)
            : "없음"}
        </p>
        <p className="text-xs text-slate-500">
          생성일: {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          project.handleDelete(project.id, project.title);
        }}
        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
        title="프로젝트 삭제"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
