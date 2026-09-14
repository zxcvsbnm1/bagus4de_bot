const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Halo Bosku! Bot Bagus4de Online Bosku! 🔥'));
bot.on('text', (ctx) => ctx.reply('Siap Bosku! Pesan Bosku: ' + ctx.message.text));

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
    }
    res.status(200).send('OK Bosku');
  } catch (e) {
    console.error(e);
    res.status(200).send('OK Bosku');
  }
};
