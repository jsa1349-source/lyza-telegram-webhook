app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // TradingView message 우선
    const text =
      body.message ||
      body.text ||
      📡 TradingView Alert\n${JSON.stringify(body, null, 2)};

    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: text
    });

    res.status(200).send("ok");
  } catch (e) {
    console.error(e);
    res.status(500).send("error");
  }
});
