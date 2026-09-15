import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  if (req.query.key!== process.env.CRON_KEY) return res.status(401).send('unauthorized')
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    const html = await fetch('https://masterlive.net/').then(r=>r.text())
    const $ = cheerio.load(html)
    let updated = []
    $('table tr').each((i, el) => {
      const tds = $(el).find('td'); if(tds.length < 3) return;
      let pasaran = $(tds[0]).text().toLowerCase();
      let result = $(tds[2]).text().replace(/\D/g,'').trim();
      if(result.length >= 4){
        let code = null;
        if(pasaran.includes('sydney') || pasaran.includes('syd')) code = 'sdy';
        if(pasaran.includes('singapore') || pasaran.includes('sgp')) code = 'sgp';
        if(pasaran.includes('hongkong') || pasaran.includes('hk')) code = 'hk';
        if(code) updated.push({ pasaran: code, result: result.slice(-4), tanggal: new Date().toISOString().split('T')[0] })
      }
    })
    for(const row of updated){ await supabase.from('result').upsert(row, { onConflict: 'pasaran' }) }
    return res.status(200).json({ ok: true, updated })
  } catch(e){ return res.status(500).json({ error: e.message }) }
}
