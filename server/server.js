// server/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRoutes from "./routes/api.js"; // API 라우트 분리 (추후 생성)

// .env 파일에서 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // 환경 변수에서 포트 가져오거나 기본값 3001 사용

// 미들웨어 설정
app.use(cors()); // CORS 허용 (개발 중 모든 출처 허용, 프로덕션에서는 특정 출처만 허용하도록 설정 권장)
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 요청 본문 파싱

// 기본 라우트 (서버 상태 확인용)
app.get("/", (req, res) => {
  res.send("AI Story Studio 서버가 실행 중입니다!");
});

// API 라우트 연결
app.use("/api", apiRoutes); // '/api' 경로로 들어오는 요청은 apiRoutes에서 처리

// 404 핸들러 (일치하는 라우트가 없을 경우)
app.use((req, res, next) => {
  res.status(404).json({ message: "요청하신 페이지를 찾을 수 없습니다." });
});

// 전역 에러 핸들러 (예: API 내부에서 발생한 에러 처리)
app.use((err, req, res, next) => {
  console.error("서버 에러 발생:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "서버 내부 오류가 발생했습니다.",
    // 개발 환경에서는 에러 스택을 포함할 수 있습니다.
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  if (!process.env.LEONARDO_API_KEY) {
    console.warn(
      "주의: LEONARDO_API_KEY 환경 변수가 설정되지 않았습니다. Leonardo AI API 연동이 정상적으로 동작하지 않을 수 있습니다."
    );
  }
});
