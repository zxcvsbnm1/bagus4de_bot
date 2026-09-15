const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELE_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

function layout(title, content) {
  return `<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - BAGUS4DE</title><script src="https://cdn.tailwindcss.com"></script>
  <style>::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#3f3f46;border-radius:10px}</style>
  </head>
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
  <main class="max-w-5xl mx-auto p-4 pb-20">${content}</main>
  <script>
    function copyText(id){
      const el=document.getElementById(id);
      navigator.clipboard.writeText(el.innerText).then(()=>{
        const btn=document.getElementById('btn-'+id);
        const old=btn.innerText;
        btn.innerText='COPIED!'; btn.classList.add('bg-green-500','text-black');
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
        <a href="/${p.pasaran}" class="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-yellow-500/30">
          <div class="flex justify-between items-center"><div class="text-yellow-400 font-black">${p.pasaran.toUpperCase()}</div><div class="text-[10px] bg-yellow-500 text-black px-2.5 py-1 rounded-full font-bold">${mapRes[p.pasaran]||'----'}</div></div>
          <div class="text-xs text-zinc-500 mt-2 truncate">${p.data.judul}</div>
          <div class="text-[11px] text-zinc-400 mt-2 break-all">BBFS: ${p.data.bbfs}</div>
        </a>`).join('');
      return res.status(200).setHeader('Content-Type','text/html').send(layout('Home', `<h1 class="text-2xl font-black mb-1">Prediksi Hari Ini</h1><p class="text-zinc-500 text-sm mb-4">Result auto TogelMaster</p><div class="grid grid-cols-1 md:grid-cols-3 gap-3">${cards}</div>`));
    }

    const { data: prediksi } = await supabase.from('prediksi').select('*').eq('pasaran', path).single();
    const { data: result } = await supabase.from('result').select('*').eq('pasaran', path).single();
    if (!prediksi) return res.status(200).setHeader('Content-Type','text/html').send(layout('404', '<p>Data tidak ada</p><a href="/" class="underline">Kembali</a>'));

    const d = prediksi.data;
    
    // BOX FULL - SEMUA TAMPIL
    const box = (label, value, id, highlight=false) => `
      <div class="bg-black/60 rounded-xl p-4 border ${highlight?'border-yellow-500/40':'border-zinc-800'}">
        <div class="flex justify-between items-center mb-3">
          <div class="text-[11px] tracking-widest uppercase font-bold ${highlight?'text-yellow-500':'text-zinc-500'}">${label}</div>
          <button id="btn-${id}" onclick="copyText('${id}')" class="text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 rounded-full transition">COPY</button>
        </div>
        <div id="${id}" class="text-[15px] font-mono font-bold leading-8 break-words whitespace-pre-wrap w-full">${value || '-'}</div>
      </div>
    `;

    const content = `
      <a href="/" class="text-zinc-500 text-sm">← Kembali ke Home</a>
      <div class="mt-4 bg-yellow-500 text-black rounded-2xl p-5">
        <div class="text-[11px] font-bold opacity-60 tracking-widest">RESULT ${path.toUpperCase()} - TOGELMASTER</div>
        <div class="text-5xl font-black tracking-widest mt-1">${result?result.result:'----'}</div>
        <div class="text-xs mt-1 font-medium">Tanggal: ${result?result.tanggal:'-'}</div>
      </div>
      <h2 class="text-xl font-bold mt-6 mb-3">${d.judul}</h2>
      <div class="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-4">
        ${box('BBFS', d.bbfs, 'bbfs')}
        ${box('4D JITU', d['4d'], '4d', true)}
        ${box('3D', d['3d'], '3d')}
        ${box('2D', d['2d'], '2d')}
        ${d.colok ? box('COLOK', d.colok, 'colok') : ''}
      </div>
    `;
    return res.status(200).setHeader('Content-Type','text/html').send(layout(path.toUpperCase(), content));
  }

  // TELEGRAM
  try{
    const msg=req.body?.message; if(!msg) return res.status(200).send('ok');
    const chatId=msg.chat.id; let txt=(msg.text||'').toLowerCase().trim();
    if(txt.startsWith('/result')){
      const target=txt.split(' ')[1];
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
