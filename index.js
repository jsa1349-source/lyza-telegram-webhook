import express from "express";
import axios from "axios";

const app = express();

// ✅ JSON + UTF-8 안전 처리
app.use(express.json({ limit: "1mb" }));

// ===== TradingView Webhook =====
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // 🔔 TradingView → Telegram 메시지
    const text =
      body.message ||
      body.text ||
      📡 TradingView Alert\n${JSON.stringify(body, null, 2)};

    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    await axios.post(
      https://api.telegram.org/bot${token}/sendMessage,
      {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML", // 한글/이모지 안정
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    return res.status(200).send("ok");
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(500).send("error");
  }
});

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("alive");
});

// ===== Server =====
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🚀 Server listening on port", port);
});
