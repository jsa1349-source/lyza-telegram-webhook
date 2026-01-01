import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    const text =
      typeof body === "string"
        ? body
        : body.message
        ? body.message
        : JSON.stringify(body);

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        disable_web_page_preview: true
      })
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.listen(3000, () => console.log("Webhook server running"));
