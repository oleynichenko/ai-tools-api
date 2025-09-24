# OpenAI Module

Этот модуль предоставляет интеграцию с OpenAI API для NestJS приложения.

## Настройка

1. Установите переменную окружения `OPENAI_API_KEY`:

   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Модуль автоматически инициализируется при запуске приложения.

## Использование

### В другом сервисе

```typescript
import { Injectable } from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class YourService {
  constructor(private readonly openAiService: OpenAiService) {}

  async generateResponse(prompt: string) {
    const response = await this.openAiService.createChatCompletion([
      { role: 'user', content: prompt },
    ]);
    return response.choices[0].message.content;
  }
}
```

### API Endpoints

#### POST /openai/chat/completions

Создает чат-завершение с использованием OpenAI API.

```json
{
  "messages": [{ "role": "user", "content": "Hello, how are you?" }],
  "model": "gpt-3.5-turbo"
}
```

#### POST /openai/embeddings

Создает эмбеддинги для текста.

```json
{
  "input": "Text to embed",
  "model": "text-embedding-ada-002"
}
```

#### POST /openai/images/generations

Генерирует изображение с помощью DALL-E.

```json
{
  "prompt": "A beautiful sunset over the ocean",
  "size": "1024x1024",
  "n": 1
}
```

#### GET /openai/models

Получает список доступных моделей OpenAI.

## Доступные методы OpenAiService

- `createChatCompletion()` - создание чат-завершений
- `createEmbedding()` - создание эмбеддингов
- `generateImage()` - генерация изображений
- `listModels()` - получение списка моделей
- `getClient()` - получение прямого доступа к OpenAI клиенту
