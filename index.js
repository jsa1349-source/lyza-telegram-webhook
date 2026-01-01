import express from "express";
import axios from "axios";

const app = express();

// ✅ TradingView의 text/plain도 받기
app.use(express.text({ type: "*/*" }));
app.use(express.json());

app.post("/webhook", async (req, res) => {
  try {
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    // ✅ req.body가 문자열(plain text)이면 그대로 사용
    const text =
      typeof req.body === "string"
        ? req.body
        : (req.body?.text ?? JSON.stringify(req.body, null, 2));

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });

    return res.status(200).send("ok");
  } catch (e) {
    console.error(e);
    return res.status(500).send("error");
  }
});

app.get("/", (req, res) => res.send("alive"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening:", port));
