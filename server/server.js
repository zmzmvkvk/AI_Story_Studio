import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRoutes from "./routes/api.js";

// .env 파일에서 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get("/", (req, res) => {
  res.send("AI Story Studio 서버가 실행 중입니다!");
});

// API 라우트 연결
app.use("/api", apiRoutes);

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({ message: "요청하신 페이지를 찾을 수 없습니다." });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error("서버 에러 발생:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "서버 내부 오류가 발생했습니다.",
    ...(process.env.NODE_ENV === "development" && { errorStack: err.stack }),
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  if (!process.env.LEONARDO_API_KEY) {
    console.warn("주의: LEONARDO_API_KEY 환경 변수가 설정되지 않았습니다.");
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn("주의: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }
});
