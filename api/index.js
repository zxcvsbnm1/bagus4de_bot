import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // biar bisa dipanggil dari frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { pasaran } = req.query; // sdy, sgp, hk
  if(!pasaran) return res.status(400).json({ error: 'isi pasaran=sdy/sgp/hk' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY // HARUS SERVICE_ROLE KEY
  );

  try {
    const table = `jadwal_${pasaran.toLowerCase()}`; // jadwal_sdy
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id', { ascending: true })
      .limit(100);

    if(error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ pasaran, jadwal: data });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
