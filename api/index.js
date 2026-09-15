import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Bagus4D Bot jalan di Vercel Bosku! Mantap Bosku!'));
bot.on('text', (ctx) => ctx.reply(`Bosku kirim: ${ctx.message.text}`));

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('Bot Jalan Bosku!');
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (e) {
    console.error(e);
    res.status(200).send('OK');
  }
}
