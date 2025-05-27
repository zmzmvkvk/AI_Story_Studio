import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./views/Home";
import Edit from "./views/Edit";
import Result from "./views/Result";
import Story from "./views/Story";
import Image from "./views/Image";
import Video from "./views/Video";
import TTS from "./views/Tts";
import Setting from "./views/Setting";
// import Detail from "./views/Detail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:id/settings" element={<Setting />} />
        <Route path="/detail/:id/story" element={<Story />} />
        <Route path="/detail/:id/image" element={<Image />} />
        <Route path="/detail/:id/video" element={<Video />} />
        <Route path="/detail/:id/tts" element={<TTS />} />
        <Route path="/detail/:id/edit" element={<Edit />} />
        <Route path="/detail/:id/" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
