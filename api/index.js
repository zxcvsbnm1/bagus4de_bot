const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
    const url = req.url || '';
    const pasaran = url.split('?')[0].replace('/', '').toLowerCase() || 'sdy';

    const { data, error } = await supabase
     .from('prediksi')
     .select('*')
     .eq('pasaran', pasaran)
     .single();

    if (error ||!data) {
      return res.status(200).send(`Pasaran ${pasaran} tidak ditemukan`);
    }

    const d = data.data;
    const text = `${d.judul}\n\nBBFS: ${d.bbfs}\n4D: ${d['4d']}\n3D: ${d['3d']}\n2D: ${d['2d']}`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
};
