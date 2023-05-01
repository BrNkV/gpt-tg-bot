// работа с аудио файлом (перевод в другой формат)

import axios from 'axios';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

//настройка работы с путями
//определим __dirname (т.к. работаем с import / export es6)
// текущая папка в которой находится файл
const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {}

  toMp3() {}

  /**
   * url - хранения файла
   * filename - в какой файл сохраним
   */
  async create(url, filename) {
    try {
      // получим ogg path
      const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`);

      // делаем запрос с помощью axios
      const response = await axios({
        method: 'get',
        url,
        // важно сделать тип - стрим
        responseType: 'stream',
      });

      return new Promise((resolve) => {
        // создаем стрим, в него передаем путь
        const stream = createWriteStream(oggPath);

        // получим res от axios, data котор в нем хранится, за пайпим его на стрим
        response.data.pipe(stream);

        // понимание завершения стрима, как только файл запишется делаем "resolve(oggPath)"
        stream.on('finish', () => resolve(oggPath));
      });
    } catch (e) {
      console.log('Error while creating ogg file', e.message);
    }
  }
}

export const ogg = new OggConverter();
