import express from "express";
import axios from "axios";

const app = express();

// TradingView webhook은 JSON으로 오기도 하고, text/plain으로 오기도 함.
// 둘 다 받게 설정 (용량은 넉넉히)
app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: "*/*", limit: "2mb" }));

function escapeHtml(s) {
  // 텔레그램은 기본 parse_mode가 없으면 괜찮지만,
  // 혹시 모를 꺾쇠/앰퍼샌드 깨짐 방지용
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

app.get("/", (req, res) => res.status(200).send("alive"));

app.post("/webhook", async (req, res) => {
  try {
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!token || !chatId) {
      console.error("Missing env: BOT_TOKEN or CHAT_ID");
      return res.status(500).send("Missing BOT_TOKEN/CHAT_ID");
    }

    // req.body가 object(JSON)일 수도 있고, string(text/plain)일 수도 있음
    let bodyObj = null;
    let rawText = "";

    if (typeof req.body === "string") {
      rawText = req.body;
      // text/plain인데 내용이 JSON 문자열인 경우도 있어서 파싱 시도
      try {
        bodyObj = JSON.parse(req.body);
      } catch {
        bodyObj = null;
      }
    } else {
      bodyObj = req.body;
      rawText = JSON.stringify(req.body);
    }

    // TradingView Alert "Message" 칸에 넣으면 보통 body.message 로 들어옴.
    // 가끔 body.text 로도 오므로 둘 다 처리.
    let text =
      (bodyObj && (bodyObj.message  bodyObj.text)) 
      (rawText && rawText.trim()) ||
      📡 TradingView Alert\n${JSON.stringify(bodyObj ?? {}, null, 2)};

    // 텔레그램 메시지 길이 제한(4096) 보호
    if (text.length > 3900) {
      text = text.slice(0, 3900) + "\n…(truncated)";
    }

    // 텔레그램으로 전송
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: text, // 한글/이모지 그대로 전송됨 (UTF-8)
      disable_web_page_preview: true,
    });

    return res.status(200).send("ok");
  } catch (e) {
    // 여기 로그가 Render에서 확인되는 핵심 디버그 포인트
    console.error("Webhook error:", e?.response?.data || e);
    return res.status(500).send("error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening:", port));
