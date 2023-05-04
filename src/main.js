import { Telegraf } from 'telegraf';

// фильтры телеграфа
import { message } from 'telegraf/filters';

// подключение токенов и констант (файл default.json)
import config from 'config';

import { ogg } from './ogg.js';

//создаем бота (принимает токен телеги)
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

// // обработка текстовой команды
// bot.on(message('text'), async (ctx) => {
//   await ctx.reply(JSON.stringify(ctx.message, null, 2));
// });

// обработка голосовой команды
bot.on(message('voice'), async (ctx) => {
  try {
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));

    // 1 - получим ссылку на голосовой файл
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    // 2 - юзер ID
    const userId = String(ctx.message.from.id);

    // тестим работу ogg конвертера
    // путь до ogg
    const oggPath = await ogg.create(link.href, userId);
    // используем метод конвертации и передаем путь файла ogg
    const mp3Path = await ogg.toMp3(oggPath, userId);

    // ответ бота
    await ctx.reply(mp3Path);
  } catch (e) {
    console.log('Error while voice message', e.message);
  }
});

// обработка команды start
bot.command('start', async (ctx) => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2));
});

// запуск бота
bot.launch();

// в случае если node процесс завершает, тогда происходит остановка бота
//остановка процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
//запрос завершения процесса
process.once('SIGTERM', () => bot.stop('SIGTERM'));
