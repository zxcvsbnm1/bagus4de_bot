export default async function handler(req, res) {
  // Biar gak error pas dibuka di browser Bosku
  if (req.method === 'GET') {
    return res.status(200).send('Bagus4de_bot Jalan Bosku!');
  }

  try {
    const token = process.env.BOT_TOKEN;
    const msg = req.body?.message;
    
    if (msg) {
      const chatId = msg.chat.id;
      let balas = 'Halo Bosku! Bot udah konek Bosku!';

      if (msg.text === '/start') balas = 'Mantap Bosku! /start jalan Bosku! Ketik /prediksi Bosku!';
      if (msg.text === '/test') balas = 'Test OK Bosku! Vercel nyambung Bosku!';
      if (msg.text === '/prediksi') balas = 'Prediksi Bagus4D Bosku: 1234 - Tembus Bosku!';

      // Kirim balik Bosku
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: balas })
      });
    }
  } catch (e) {
    console.log(e);
  }
  
  // WAJIB bales OK Bosku ke Telegram Bosku
  res.status(200).send('OK');
}
