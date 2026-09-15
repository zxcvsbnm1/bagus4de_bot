const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELE_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

function layout(title, content){ return `<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - BAGUS4DE</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#0f0f0f] text-white"><nav class="bg-black border-b border-yellow-500/30 sticky top-0"><div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center"><a href="/" class="font-black text-yellow-400 text-xl">BAGUS4DE</a><div class="flex gap-1 text-[11px]"><a href="/" class="px-3 py-1.5 bg-zinc-800 rounded-full">HOME</a><a href="/sdy" class="px-3 py-1.5 bg-zinc-800 rounded-full">SDY</a><a href="/sgp" class="px-3 py-1.5 bg-zinc-800 rounded-full">SGP</a><a href="/hk" class="px-3 py-1.5 bg-zinc-800 rounded-full">HK</a></div></div></nav><main class="max-w-5xl mx-auto p-4">${content}</main></body></html>`;}

module.exports = async (req, res) => {
  const path = (req.url.split('?')[0].replace('/','').toLowerCase()||'');

  if(req.method==='GET'){
    if(!path){
      const {data:all}=await supabase.from('prediksi').select('*');
      const cards=all.map(p=>`<a href="/${p.pasaran}" class="block bg-zinc-900 border border-zinc-800 rounded-xl p-4"><div class="text-yellow-400 font-bold">${p.pasaran.toUpperCase()}</div><div class="text-xs text-zinc-500">Result & Prediksi</div></a>`).join('');
      return res.status(200).setHeader('Content-Type','text/html').send(layout('Home',`<h1 class="text-2xl font-bold mb-4">Pilih Pasaran</h1><div class="grid grid-cols-2 gap-3">${cards}</div><div class="mt-6"><a href="/api/cron?key=${process.env.CRON_KEY}" class="text-xs text-zinc-600 underline">Force Update Result dari TogelMaster</a></div>`));
    }
    const {data:prediksi}=await supabase.from('prediksi').select('*').eq('pasaran',path).single();
    const {data:result}=await supabase.from('result').select('*').eq('pasaran',path).single();
    if(!prediksi) return res.status(200).setHeader('Content-Type','text/html').send(layout('404','<p>Data tidak ada</p>'));
    const d=prediksi.data;
    const content=`<a href="/" class="text-zinc-500 text-sm">← Home</a><div class="mt-4 bg-yellow-500 text-black rounded-2xl p-5"><div class="text-xs font-bold opacity-60">RESULT ${path.toUpperCase()} - TOGELMASTER</div><div class="text-5xl font-black tracking-widest mt-1">${result?result.result:'----'}</div><div class="text-xs mt-2">Tanggal: ${result?result.tanggal:'-'}</div></div><h2 class="text-xl font-bold mt-6 mb-3">Prediksi ${path.toUpperCase()}</h2><div class="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"><div class="grid grid-cols-2 gap-4"><div><div class="text-zinc-500 text-xs">BBFS</div><div class="text-xl font-mono font-bold">${d.bbfs}</div></div><div><div class="text-zinc-500 text-xs">4D</div><div class="text-xl font-mono font-bold text-yellow-400">${d['4d']}</div></div><div><div class="text-zinc-500 text-xs">3D</div><div class="text-lg font-mono">${d['3d']}</div></div><div><div class="text-zinc-500 text-xs">2D</div><div class="text-lg font-mono">${d['2d']}</div></div></div></div>`;
    return res.status(200).setHeader('Content-Type','text/html').send(layout(path.toUpperCase(),content));
  }

  // TELEGRAM
  try{
    const msg=req.body?.message; if(!msg) return res.status(200).send('ok');
    const chatId=msg.chat.id;
    let txt=(msg.text||'').toLowerCase().trim();

    // /result sdy
    if(txt.startsWith('/result')){
      const parts=txt.split(' ');
      const target=parts[1];
      if(target){
        const {data:resu}=await supabase.from('result').select('*').eq('pasaran',target).single();
        const {data:pred}=await supabase.from('prediksi').select('*').eq('pasaran',target).single();
        let reply=`RESULT ${target.toUpperCase()}: ${resu?resu.result:'-'}\nTanggal: ${resu?resu.tanggal:'-'}\n\nPREDIKSI: ${pred?pred.data.bbfs:'-'}`;
        await fetch(TELE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:reply})});
        return res.status(200).send('ok');
      } else {
        const {data:allRes}=await supabase.from('result').select('*');
        let reply=`📊 RESULT HARI INI (TogelMaster)\n\n`+allRes.map(r=>`${r.pasaran.toUpperCase()}: ${r.result} (${r.tanggal})`).join('\n')+`\n\nKetik /sdy /sgp /hk untuk prediksi lengkap`;
        await fetch(TELE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:reply})});
        return res.status(200).send('ok');
      }
    }

    // /sdy /sgp /hk
    const pasaran=txt.replace('/','').trim();
    const {data:prediksi}=await supabase.from('prediksi').select('*').eq('pasaran',pasaran).single();
    const {data:result}=await supabase.from('result').select('*').eq('pasaran',pasaran).single();
    let reply=`Menu: /sdy /sgp /hk /result`;
    if(prediksi){ const d=prediksi.data; reply=`🏆 RESULT ${pasaran.toUpperCase()}: ${result?result.result:'-'}\n📅 ${result?result.tanggal:''}\n\n🔮 PREDIKSI ${pasaran.toUpperCase()}\nBBFS: ${d.bbfs}\n4D: ${d['4d']}\n3D: ${d['3d']}\n2D: ${d['2d']}\n\nWeb: https://bagus4de-bot.vercel.app/${pasaran}`; }
    await fetch(TELE_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:reply})});
    return res.status(200).send('ok');
  }catch(e){ return res.status(200).send('ok'); }
}
