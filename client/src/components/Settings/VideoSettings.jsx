// src/components/Settings/VideoSettings.jsx (새로 생성 또는 기존 파일 수정)
import React from "react";
import { Film } from "lucide-react";

export default function VideoSettings({ video, onSettingChange }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center mb-6">
        <Film size={24} className="text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-slate-700">비디오 설정</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="video-resolution"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            해상도
          </label>
          <select
            id="video-resolution"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={video.resolution}
            onChange={(e) => onSettingChange("resolution", e.target.value)}
          >
            <option value="1080p">1080p (Full HD)</option>
            <option value="720p">720p (HD)</option>
            <option value="2160p">2160p (4K)</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="video-fps"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            FPS (초당 프레임)
          </label>
          <select
            id="video-fps"
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
            value={video.fps}
            onChange={(e) =>
              onSettingChange("fps", parseInt(e.target.value, 10))
            }
          >
            <option value={30}>30 FPS</option>
            <option value={60}>60 FPS</option>
            <option value={24}>24 FPS (시네마틱)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
