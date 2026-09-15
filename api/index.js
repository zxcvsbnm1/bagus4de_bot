import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let pasaran = (req.query.pasaran || '').toString().toLowerCase().trim();
  if(!pasaran) pasaran = 'sdy'; // default biar tidak error "Pasaran tidak ditemukan"

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  let table = 'jadwal_sdy';
  if(pasaran === 'sgp') table = 'jadwal_sgp';
  if(pasaran === 'hk') table = 'jadwal_hk';
  if(pasaran === 'sdy') table = 'jadwal_sdy';

  const { data, error } = await supabase.from(table).select('*').order('id', {ascending:true}).limit(100);

  if(error){
    return res.status(500).json({ error: error.message, table });
  }

  return res.status(200).json({ pasaran, jadwal: data });
}
