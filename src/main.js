import { Telegraf, session } from 'telegraf';

// фильтры телеграфа
import { message } from 'telegraf/filters';

// форматтер стилистики текста
import { code } from 'telegraf/format';

// подключение токенов и констант (файл default.json)
import config from 'config';

import { ogg } from './ogg.js';

import { openai } from './openai.js';

// для каждого пользователя своя сессия
const INITIAL_SESSION = {
  message: [],
};

//создаем бота (принимает токен телеги)
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

// бот будет использовать сессии
bot.use(session());

// при вводе /new будет создаваться новый контекст(новая беседа) (если нет то диалог продолжается)
bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply(code('Жду Ваше сообщение голосом или текстом...'));
});

// обработка команды start
bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply(code('Жду Ваше сообщение голосом или текстом...'));
});

// // обработка текстовой команды
// bot.on(message('text'), async (ctx) => {
//   await ctx.reply(JSON.stringify(ctx.message, null, 2));
// });

// обработка голосовой команды VOICE
bot.on(message('voice'), async (ctx) => {
  // если сессия не определена (если сессия = null или undef тогда INITIAL_SESSION)
  ctx.session ??= INITIAL_SESSION;
  try {
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
    await ctx.reply(
      code('Сообщение принято к обработке. Ожидается ответ от сервера...'),
    );

    // 1 - получим ссылку на голосовой файл
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    // 2 - юзер ID
    const userId = String(ctx.message.from.id);

    // тестим работу ogg конвертера
    // путь до ogg
    const oggPath = await ogg.create(link.href, userId);
    // используем метод конвертации и передаем путь файла ogg
    const mp3Path = await ogg.toMp3(oggPath, userId);

    // получаем текст (обработка openAi - принимает к обработке наш мп3)
    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`));

    // затем openai определенный текст передаст в чат
    // переделаем на messages
    ctx.session.messages.push({ role: openai.roles.USER, content: 'text' });
    // получаем ответ
    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);

    // ответ бота (передаем "text" - когда на Api есть деньги)
    //FIXME оплатить OpenAi API передать "text"
    await ctx.reply(mp3Path); //можно убрать
  } catch (e) {
    console.log('Error while voice message', e.message);
  }
});

// обработка текстовой команды TEXT
bot.on(message('text'), async (ctx) => {
  // если сессия не определена (если сессия = null или undef тогда INITIAL_SESSION)
  ctx.session ??= INITIAL_SESSION;
  try {
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
    await ctx.reply(
      code('Сообщение принято к обработке. Ожидается ответ от сервера...'),
    );

    // затем openai определенный текст передаст в чат
    // переделаем на messages
    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });
    // получаем ответ
    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);

    // ответ бота (передаем "text" - когда на Api есть деньги)
    //FIXME оплатить OpenAi API передать "text"
    await ctx.reply(mp3Path); //можно убрать
  } catch (e) {
    console.log('Error while text message', e.message);
  }
});

// запуск бота
bot.launch();

// в случае если node процесс завершает, тогда происходит остановка бота
//остановка процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
//запрос завершения процесса
process.once('SIGTERM', () => bot.stop('SIGTERM'));
