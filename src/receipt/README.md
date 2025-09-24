# Receipt Module

Модуль для парсинга чеков с использованием OpenAI Vision API.

## Функциональность

Модуль позволяет загружать изображения чеков и автоматически извлекать из них структурированную информацию:

- Дата чека
- Общая сумма
- Список товаров с описанием и ценой
- Название магазина/поставщика

## API Endpoints

### POST /receipt/parse-receipt

Парсит изображение чека и возвращает структурированные данные.

**Параметры:**

- `file` - изображение чека (multipart/form-data)
- Поддерживаемые форматы: JPG, PNG, GIF, BMP, WebP
- Максимальный размер файла: 10MB

**Пример запроса:**

```bash
curl -X POST http://localhost:3000/receipt/parse-receipt \
  -F "file=@receipt.jpg"
```

**Пример ответа:**

```json
{
  "date": "2024-01-15",
  "total": 125.5,
  "items": [
    {
      "description": "Хлеб белый",
      "price": 45.0
    },
    {
      "description": "Молоко 1л",
      "price": 80.5
    }
  ],
  "vendorName": "Магазин у дома"
}
```

## Использование в коде

```typescript
import { ReceiptService } from './receipt/receipt.service';

@Injectable()
export class YourService {
  constructor(private readonly receiptService: ReceiptService) {}

  async processReceipt(imageBuffer: Buffer, mimeType: string) {
    return this.receiptService.parseReceipt(imageBuffer, mimeType);
  }
}
```

## Требования

- OpenAI API ключ должен быть установлен в переменной окружения `OPENAI_API_KEY`
- Используется модель `gpt-4o-mini` для анализа изображений

## Обработка ошибок

- `400 Bad Request` - если файл не загружен или имеет неверный формат
- `400 Bad Request` - если не удалось распарсить чек
- `500 Internal Server Error` - при ошибках OpenAI API
