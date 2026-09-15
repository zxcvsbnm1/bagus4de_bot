import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const pasaran = (req.query.pasaran||'sdy').toLowerCase();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const table = pasaran==='sgp'?'jadwal_sgp':pasaran==='hk'?'jadwal_hk':'jadwal_sdy';
  const {data:jadwal} = await supabase.from(table).select('*').order('id',{ascending:true}).limit(50);
  const {data:prediksi} = await supabase.from('prediksi').select('*').eq('pasaran',pasaran).order('created_at',{ascending:false}).limit(1).single();
  return res.status(200).json({pasaran,jadwal,prediksi});
}
