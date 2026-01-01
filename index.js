import express from "express";
import axios from "axios";

const app = express();

// TradingView는 JSON / text/plain 둘 다 보냄
app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: "*/*", limit: "2mb" }));

app.get("/", (req, res) => {
  res.status(200).send("alive");
});

app.post("/webhook", async (req, res) => {
  try {
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!token || !chatId) {
      console.error("❌ BOT_TOKEN 또는 CHAT_ID 없음");
      return res.status(500).send("env missing");
    }

    let bodyObj = null;
    let rawText = "";

    if (typeof req.body === "string") {
      rawText = req.body;
      try {
        bodyObj = JSON.parse(req.body);
      } catch {
        bodyObj = null;
      }
    } else {
      bodyObj = req.body;
      rawText = JSON.stringify(req.body);
    }

    const text =
      (bodyObj && (bodyObj.message  bodyObj.text)) 
      (rawText && rawText.trim()) ||
      📡 TradingView Alert\n${JSON.stringify(bodyObj ?? {}, null, 2)};

    await axios.post(
      https://api.telegram.org/bot${token}/sendMessage,
      {
        chat_id: chatId,
        text: text,
        disable_web_page_preview: true,
      }
    );

    return res.status(200).send("ok");
  } catch (e) {
    console.error("🔥 Webhook Error:", e?.response?.data || e);
    return res.status(500).send("error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🚀 listening:", port);
});
