// подключаем OpenAi API
import { Configuration, OpenAIApi } from 'openai';
import config from 'config';

class OpenAi {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  chat() {}

  transcription() {}
}

export const openai = new OpenAi(config.get('OPENAI_KEY'));
