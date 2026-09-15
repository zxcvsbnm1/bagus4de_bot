const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELE_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

function layout(title, content) {
  return `<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - BAGUS4DE</title><script src="https://cdn.tailwindcss.com"></script></head>
  <body class="bg-[#0f0f0f] text-white min-h-screen">
  <nav class="bg-black border-b border-yellow-500/30 sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
      <a href="/" class="font-black text-yellow-400 text-xl">BAGUS4DE</a>
      <div class="flex gap-1.5 text-[11px] font-bold">
        <a href="/" class="px-3.5 py-2 bg-zinc-800 rounded-full">HOME</a>
        <a href="/sdy" class="px-3.5 py-2 bg-zinc-800 rounded-full">SDY</a>
        <a href="/sgp" class="px-3.5 py-2 bg-zinc-800 rounded-full">SGP</a>
        <a href="/hk" class="px-3.5 py-2 bg-zinc-800 rounded-full">HK</a>
      </div>
    </div>
  </nav>
  <main class="max-w-5xl mx-auto p-4">${content}</main>
  <script>
    function copyText(id){
      const el=document.getElementById(id);
      navigator.clipboard.writeText(el.innerText).then(()=>{
        const btn=document.getElementById('btn-'+id);
        const old=btn.innerText;
        btn.innerText='COPIED!';
        btn.classList.add('bg-green-500','text-black');
        setTimeout(()=>{btn.innerText=old; btn.classList.remove('bg-green-500','text-black');},1500);
      });
    }
  </script>
  </body></html>`;
}

module.exports = async (req, res) => {
  const path = (req.url.split('?')[0].replace('/', '').toLowerCase() || '');

  if (req.method === 'GET') {
    if (!path || path.startsWith('api')) {
      const { data: all } = await supabase.from('prediksi').select('*');
      const { data: results } = await supabase.from('result').select('*');
      const mapRes = {}; (results||[]).forEach(r=>mapRes[r.pasaran]=r.result);
      const cards = (all||[]).map(p=>`
        <a href="/${p.pasaran}" class="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div class="flex justify-between items-center"><div class="text-yellow-400 font-black">${p.pasaran.toUpperCase()}</div><div class="text-[10px] bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">${mapRes[p.pasaran]||'----'}</div></div>
          <div class="text-xs text-zinc-500 mt-2">${p.data.judul}</div>
        </a>`).join('');
      return res.status(200).setHeader('Content-Type','text/html').send(layout('Home', `<h1 class="text-2xl font-black mb-4">Prediksi Hari Ini</h1><div class="grid grid-cols-1 md:grid-cols-3 gap-3">${cards}</div>`));
    }

    const { data: prediksi } = await supabase.from('prediksi').select('*').eq('pasaran', path).single();
    const { data: result } = await supabase.from('result').select('*').eq('pasaran', path).single();
    if (!prediksi) return res.status(200).setHeader('Content-Type','text/html').send(layout('404', '<p>Data tidak ada</p>'));

    const d = prediksi.data;
    const box = (label, value, id, highlight=false) => `
      <div class="bg-black/60 rounded-xl p-4 border ${highlight?'border-yellow-500/30':''}">
        <div class="flex justify-between items-center">
          <div class="text-[10px] tracking-widest uppercase ${highlight?'text-yellow-500 font-bold':'text-zinc-500'}">${label}</div>
          <button id="btn-${id}" onclick="copyText('${id}')" class="text-[10px] bg-zinc-800 px-3 py-1 rounded-full hover:bg-zinc-700">COPY</button>
        </div>
        <div id="${id}" class="text-base font-mono font-bold break-all leading-8 mt-2 ${highlight?'text-yellow-400':''}">${value}</div>
      </div>
    `;

    const content = `
      <a href="/" class="text-zinc-500 text-sm">← Kembali</a>
      <div class="mt-4 bg-yellow-500 text-black rounded-2xl p-5">
        <div class="text-[11px] font-bold opacity-60">RESULT ${path.toUpperCase()}</div>
        <div class="text-5xl font-black tracking-widest mt-1">${result?result.result:'----'}</div>
        <div class="text-xs mt-1">${result?result.tanggal:'-'}</div>
      </div>
      <h2 class="text-xl font-bold mt-6 mb-3">${d.judul}</h2>
      <div class="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
        ${box('BBFS', d.bbfs, 'bbfs')}
        ${box('4D JITU', d['4d'], '4d', true)}
        ${box('3D', d['3d'], '3d')}
        ${box('2D', d['2d'], '2d')}
      </div>
    `;
    return res.status(200).setHeader('Content-Type','text/html').send(layout(path.toUpperCase(), content));
  }

  // Telegram tetap sama
  try{
    const msg=req.body?.message; if(!msg) return res.status(200).send('ok');
    const chatId=msg.chat.id;
    let txt=(msg.text||'').toLowerCase().trim();
    if(txt.startsWith('/result')){
      const parts=txt.split(' '); const target=parts[1];
      if(target){
        const {data:resu}=await supabase.from('result').select('*').eq('pasaran',target).single();
        const {data:pred}=await supabase.from('prediksi').select('*').eq('pasaran',target).single();
        let reply=`RESULT ${target.toUpperCase()}: ${resu?resu.result:'-'}\nBBFS: ${pred?pred.data.bbfs:'-'}`;
        await fetch(TELE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:reply})});
        return res.status(200).send('ok');
      } else {
        const {data:allRes}=await supabase.from('result').select('*');
        let reply=`📊 RESULT HARI INI\n\n`+(allRes||[]).map(r=>`${r.pasaran.toUpperCase()}: ${r.result}`).join('\n');
        await fetch(TELE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:reply})});
        return res.status(200).send('ok');
      }
    }
    const pasaran=txt.replace('/','').trim();
    const {data:prediksi}=await supabase.from('prediksi').select('*').eq('pasaran',pasaran).single();
    const {data:result}=await supabase.from('result').select('*').eq('pasaran',pasaran).single();
    let reply=`Menu: /sdy /sgp /hk /result`;
    if(prediksi){ const d=prediksi.data; reply=`🏆 RESULT ${pasaran.toUpperCase()}: ${result?result.result:'-'}\n\n🔮 ${d.judul}\nBBFS: ${d.bbfs}\n4D: ${d['4d']}\n3D: ${d['3d']}\n2D: ${d['2d']}\n\nWeb: https://bagus4de-bot.vercel.app/${pasaran}`; }
    await fetch(TELE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:reply})});
    return res.status(200).send('ok');
  }catch(e){ return res.status(200).send('ok'); }
}
