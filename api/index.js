import { createClient } from '@supabase/supabase-js'
export default async function handler(req,res){
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  const p = (req.query.pasaran || 'hk').toLowerCase()
  const { data } = await supa.from('prediksi').select('*').eq('pasaran', p).single()
  res.status(200).json({ prediksi: data })
}
