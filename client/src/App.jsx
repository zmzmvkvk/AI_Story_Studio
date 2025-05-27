import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./views/Home";
import Edit from "./views/Edit";
import Result from "./views/Result";
import Story from "./views/Story";
import Image from "./views/Image";
import Video from "./views/Video";
import TTS from "./views/Tts";
import Setting from "./views/Setting";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/edit/:id/settings" element={<Setting />} />
        <Route path="/edit/:id/story" element={<Story />} />
        <Route path="/edit/:id/image" element={<Image />} />
        <Route path="/edit/:id/video" element={<Video />} />
        <Route path="/edit/:id/tts" element={<TTS />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
