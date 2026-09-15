export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Bot Bagus4D Jalan Bosku!');
  }
  try {
    const token = process.env.BOT_TOKEN;
    const msg = req.body?.message;
    if (msg) {
      // Balas dulu Bosku biar gak timeout Bosku
      res.status(200).json({ ok: true });
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          text: `Masuk Bosku: ${msg.text}`
        })
      });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: true });
  }
}
