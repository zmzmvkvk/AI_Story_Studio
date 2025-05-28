// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./views/Home";
import Edit from "./views/Edit";
import Result from "./views/Result";
import Story from "./views/Story";
import Image from "./views/Image";
import Video from "./views/Video";
import TTS from "./views/Tts";
import Setting from "./views/Setting";
import DetailLayout from "./components/Layout/DetailLayout"; // 새로운 레이아웃 컴포넌트 임포트

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:id" element={<DetailLayout />}>
          <Route path="settings" element={<Setting />} />
          <Route path="story" element={<Story />} />
          <Route path="image" element={<Image />} />
          <Route path="video" element={<Video />} />
          <Route path="tts" element={<TTS />} />
          <Route path="edit" element={<Edit />} />
          <Route path="result" element={<Result />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
