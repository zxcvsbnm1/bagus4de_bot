const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELE_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

function layout(title, content) {
  return `
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} - BAGUS4DE</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-[#0f0f0f] text-white min-h-screen">
    <!-- NAVBAR -->
    <nav class="bg-black border-b border-yellow-500/30 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" class="text-xl font-black text-yellow-400">BAGUS4DE</a>
        <div class="flex gap-2 text-sm">
          <a href="/" class="px-3 py-1.5 bg-zinc-800 rounded-full">HOME</a>
          <a href="/sdy" class="px-3 py-1.5 bg-yellow-500 text-black font-bold rounded-full">SDY</a>
          <a href="/sgp" class="px-3 py-1.5 bg-zinc-800 rounded-full">SGP</a>
          <a href="/hk" class="px-3 py-1.5 bg-zinc-800 rounded-full">HK</a>
        </div>
      </div>
    </nav>
    <main class="max-w-5xl mx-auto p-4">
      ${content}
    </main>
  </body>
  </html>`;
}

module.exports = async (req, res) => {
  const path = (req.url.split('?')[0].replace('/', '').toLowerCase() || '');

  // === BROWSER / WEB ===
  if (req.method === 'GET') {
    if (!path) {
      const { data: all } = await supabase.from('prediksi').select('*');
      const cards = all.map(p => `
        <a href="/${p.pasaran}" class="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-yellow-500">
          <div class="text-yellow-400 font-bold text-lg">${p.pasaran.toUpperCase()}</div>
          <div class="text-sm text-zinc-400">${p.data.judul}</div>
          <div class="mt-2 text-xs bg-black inline-block px-2 py-1 rounded">BBFS: ${p.data.bbfs}</div>
        </a>
      `).join('');
      const content = `<h1 class="text-2xl font-bold mb-4">Prediksi Hari Ini</h1><div class="grid grid-cols-1 md:grid-cols-3 gap-3">${cards}</div>`;
      return res.status(200).setHeader('Content-Type','text/html').send(layout('Home', content));
    } else {
      const { data } = await supabase.from('prediksi').select('*').eq('pasaran', path).single();
      if (!data) return res.status(200).setHeader('Content-Type','text/html').send(layout('404', '<p>Pasaran tidak ditemukan</p>'));
      const d = data.data;
      const content = `
        <a href="/" class="text-zinc-400 text-sm">← Kembali ke Home</a>
        <h1 class="text-3xl font-black mt-3 text-yellow-400">${d.judul}</h1>
        <div class="mt-6 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div class="grid grid-cols-2 gap-4">
            <div><div class="text-zinc-500 text-xs">BBFS</div><div class="text-xl font-mono font-bold">${d.bbfs}</div></div>
            <div><div class="text-zinc-500 text-xs">4D JITU</div><div class="text-xl font-mono font-bold text-yellow-400">${d['4d']}</div></div>
            <div><div class="text-zinc-500 text-xs">3D</div><div class="text-lg font-mono">${d['3d']}</div></div>
            <div><div class="text-zinc-500 text-xs">2D</div><div class="text-lg font-mono">${d['2d']}</div></div>
          </div>
        </div>`;
      return res.status(200).setHeader('Content-Type','text/html').send(layout(path.toUpperCase(), content));
    }
  }

  // === TELEGRAM ===
  try {
    const msg = req.body?.message; if(!msg) return res.status(200).send('ok');
    const chatId = msg.chat.id;
    const txt = (msg.text || '').toLowerCase().replace('/','').trim();
    const { data } = await supabase.from('prediksi').select('*').eq('pasaran', txt).single();
    let reply = `Menu: /sdy /sgp /hk`;
    if(data){ const d=data.data; reply = `${d.judul}\n\nBBFS: ${d.bbfs}\n4D: ${d['4d']}\n3D: ${d['3d']}\n2D: ${d['2d']}\n\nCek web: https://bagus4de-bot.vercel.app/${txt}`; }
    await fetch(TELE_API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({chat_id:chatId, text:reply}) });
    return res.status(200).send('ok');
  } catch(e){ return res.status(200).send('ok'); }
}
