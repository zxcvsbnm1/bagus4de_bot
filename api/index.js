const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
  ctx.reply('✅ Bot Bagus4D Jembatan Aktif Bosku!')
})

bot.on('text', (ctx) => {
  ctx.reply('Jembatan Vercel - Tele nyambung Bosku!')
})

module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body)
  } catch (e) {
    console.log(e)
  }
  res.status(200).send('OK BOSKU')
}
