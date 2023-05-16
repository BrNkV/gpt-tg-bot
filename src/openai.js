// подключаем OpenAi API
import { Configuration, OpenAIApi } from 'openai';
import config from 'config';
import { createReadStream } from 'fs';

class OpenAi {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system: ',
  };

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      // передаем модель
      // передаем объект messages(массив сообщения (роль{system, user, assistant(ответ GPT чата или контекст диалога)}, контент, имя?))
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      });
      // распарсиваем поступающий JSON
      return response.data.choices[0].message
    } catch (e) {
      console.log('Error while GPTchat' + e.message);
    }
  }

  async transcription() {
    try {
      // (1)передаем файл(не путь) / один из вариантов создать стрим
      //(2) передаем модель
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1',
      );
      // возврат ответа с текстом
      return response.data.text;
    } catch (e) {
      console.log('Error while transcription' + e.message);
    }
  }
}

export const openai = new OpenAi(config.get('OPENAI_KEY'));
