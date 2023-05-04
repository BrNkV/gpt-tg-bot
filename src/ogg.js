// работа с аудио файлом (перевод в другой формат)

import { rejects } from 'assert';
import axios from 'axios';
// ядро кодеков
import ffmpeg from 'fluent-ffmpeg';
// установщик конвертера
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

//настройка работы с путями
//определим __dirname (т.к. работаем с import / export es6)
// текущая папка в которой находится файл
const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    // настройка пути до конвертера
    ffmpeg.setFfmpegPath(installer.path);
  }

  /** конвертируем в мп3
   * input - название входного файла
   * output - выходной файл
   */
  toMp3(input, output) {
    try {
      // получим выходной путь
      const outputPath = resolve(dirname(input), `${output}.mp3`);

      // работа с кодеками
      return new Promise((resolve, reject) => {
        // логика трансформации ogg => mp3

        // принимает input = ogg file
        ffmpeg(input)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => resolve(outputPath))
          .on('error', (err) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.log('Error while creating mp3 file', e.message);
    }
  }

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
