import { Telegraf } from 'telegraf';

//создаем бота (принимает токен телеги)
const bot = new Telegraf();

// запуск бота
bot.launch();

// в случае если node процесс завершает, тогда происходит остановка бота
//остановка процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
//запрос завершения процесса
process.once('SIGTERM', () => bot.stop('SIGTERM'));
