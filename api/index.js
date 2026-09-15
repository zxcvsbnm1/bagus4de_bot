const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELE_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

module.exports = async (req, res) => {
  // 1. Jika diakses via browser /sdy /sgp /hk
  const path = req.url.split('?')[0].replace('/', '').toLowerCase();
  if (req.method === 'GET' && path) {
     const { data } = await supabase.from('prediksi').select('*').eq('pasaran', path).single();
     if(!data) return res.status(200).send('Pasaran tidak ada');
     const d = data.data;
     return res.status(200).send(`${d.judul}\n\nBBFS: ${d.bbfs}\n4D: ${d['4d']}`);
  }

  // 2. Jika diakses via Telegram webhook
  try {
    const msg = req.body?.message;
    if (!msg) return res.status(200).send('ok');
    
    const chatId = msg.chat.id;
    const text = (msg.text || '').toLowerCase().replace('/', '').trim(); // /sdy jadi sdy

    const { data } = await supabase.from('prediksi').select('*').eq('pasaran', text).single();

    let reply = `Ketik /sdy /sgp /hk untuk prediksi`;
    if(data) {
      const d = data.data;
      reply = `${d.judul}\n\nBBFS: ${d.bbfs}\n4D: ${d['4d']}\n3D: ${d['3d']}\n2D: ${d['2d']}`;
    }

    await fetch(TELE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });

    return res.status(200).send('ok');
  } catch(e) {
    return res.status(200).send('error: ' + e.message);
  }
}
