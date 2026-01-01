import express from "express";
import axios from "axios";

const app = express();

// TradingView는 JSON으로도 보내고, 간혹 text/plain으로도 보냄.
// 둘 다 받기 위해 미들웨어 2개를 같이 둠.
app.use(express.json({ limit: "1mb" }));
app.use(express.text({ type: ["text/plain", "text/*"], limit: "1mb" }));

function pickText(payload) {
  // payload가 문자열이면: JSON처럼 생겼으면 파싱 시도, 아니면 그대로 메시지
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        const obj = JSON.parse(trimmed);
        return (
          obj.message ||
          obj.text ||
          obj.alert_message ||
          obj.title ||
          📡 TradingView Alert\n${JSON.stringify(obj, null, 2)}
        );
      } catch {
        return payload; // JSON 파싱 실패면 그냥 문자 그대로
      }
    }
    return payload;
  }

  // 객체(JSON)인 경우
  if (payload && typeof payload === "object") {
    return (
      payload.message ||
      payload.text ||
      payload.alert_message ||
      payload.title ||
      📡 TradingView Alert\n${JSON.stringify(payload, null, 2)}
    );
  }

  return "📡 TradingView Alert (empty body)";
}

app.get("/", (req, res) => res.status(200).send("alive"));

app.post("/webhook", async (req, res) => {
  try {
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).send("Missing BOT_TOKEN or CHAT_ID");
    }

    const text = pickText(req.body);

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: String(chatId),      // 채널 id는 -100... 형태라 문자열로 안전하게
      text,
      disable_web_page_preview: true,
    });

    return res.status(200).send("ok");
  } catch (e) {
    console.error("WEBHOOK ERROR:", e?.response?.data  e?.message  e);
    return res.status(500).send("error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening:", port));
