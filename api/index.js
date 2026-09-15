import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'SUPABASE_URL / KEY belum di set di Vercel' })
    }

    const supa = createClient(supabaseUrl, supabaseKey)
    const p = (req.query.pasaran || 'hk').toLowerCase().trim()

    const { data, error } = await supa
      .from('prediksi')
      .select('*')
      .eq('pasaran', p)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Pasaran tidak ditemukan', pasaran: p })
    }

    // biar support 2 format data
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    return res.status(200).json({ prediksi: data })

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
