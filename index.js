import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // ✅ TradingView message만 사용
    const text =
      body.message ??
      body.text ??
      "⚠️ TradingView alert received (no message)";

    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
      }
    );

    return res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    return res.status(500).send("error");
  }
});

app.get("/", (req, res) => res.send("alive"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("listening:", port);
});
