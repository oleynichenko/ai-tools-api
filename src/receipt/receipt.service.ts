import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';
import { ReceiptResponseDto } from './dto/receipt-response.dto';
import { FileService } from '../file/file.service';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly fileService: FileService,
  ) {}

  async parseReceipt(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<ReceiptResponseDto> {
    try {
      this.logger.debug('Starting receipt parsing with OpenAI Vision');

      // Конвертируем буфер в base64
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      // Создаем промпт для анализа чека
      const prompt = `
Analyze the receipt image and extract the following information in JSON format:
{
  "date": "date in YYYY-MM-DD format",
  "total": number (total amount),
  "items": [
    {
      "description": "item description",
      "price": number (item price)
    }
  ],
  "vendorName": "store/vendor name"
}

Important:

Return ONLY valid JSON, without any code fences or explanations

Prices must be numbers (not strings)

If some information is missing, use reasonable default values

For the date, use the YYYY-MM-DD format

Item descriptions should be clear and concise

If the image does not contain information similar to a receipt, return an appropriate message as a string
`;

      const response = await this.openAiService.createChatCompletion(
        [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        'gpt-4o-mini',
      );

      // Сохраняем ответ в файл
      await this.fileService.saveResponse(response);

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      this.logger.debug(`OpenAI response: ${content}`);

      // Парсим JSON ответ
      let parsedResult: ReceiptResponseDto;

      try {
        parsedResult = JSON.parse(content);
      } catch (parseError) {
        this.logger.error(
          'Failed to parse OpenAI response as JSON',
          parseError,
        );

        // Попытка извлечь JSON из текста, если он обернут в дополнительный текст
        const jsonMatch = content.match(/\{[\s\S]*}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Unable to parse receipt data from OpenAI response');
        }
      }

      // Валидация результата
      this.validateReceiptData(parsedResult);

      this.logger.debug('Receipt parsed successfully');
      return parsedResult;
    } catch (error) {
      this.logger.error('Failed to parse receipt', error);
      throw new Error(error.message);
    }
  }

  private validateReceiptData(data: any): void {
    if (!data) {
      throw new Error('Invalid receipt data structure');
    }

    if (typeof data !== 'object') {
      throw new Error(data);
    }

    if (
      !data.date ||
      !Object.hasOwn(data, 'total') ||
      !data.items ||
      !data.vendorName
    ) {
      throw new Error('Missing required receipt fields');
    }

    if (!Array.isArray(data.items)) {
      throw new Error('Items must be an array');
    }

    if (data.items.length) {
      for (const item of data.items) {
        if (!item.description || typeof item.price !== 'number') {
          throw new Error('Invalid item structure');
        }
      }
    }

    if (typeof data.total !== 'number') {
      throw new Error('Total must be a number');
    }
  }
}
