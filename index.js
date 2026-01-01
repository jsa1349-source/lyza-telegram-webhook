import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ===== Webhook endpoint =====
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body || {};

    // TradingView에서 message / text / 아무것도 없을 때 대비
    let text = "";

    if (typeof body.message === "string") {
      text = body.message;
    } else if (typeof body.text === "string") {
      text = body.text;
    } else {
      text =
        "TradingView Alert\n\n" +
        JSON.stringify(body, null, 2);
    }

    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!token || !chatId) {
      throw new Error("BOT_TOKEN or CHAT_ID not set");
    }

    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
      }
    );

    return res.status(200).send("ok");
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).send("error");
  }
});

// ===== Health check =====
app.get("/", (req, res) => {
  res.send("alive");
});

// ===== Start server =====
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log("listening on port", port);
});
