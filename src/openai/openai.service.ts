import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    this.logger.log('OpenAI service initialized successfully');
  }

  /**
   * Создает чат-завершение с использованием OpenAI API
   */
  async createChatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo',
    options?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParams>,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      this.logger.debug(`Creating chat completion with model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        stream: false,
        ...options,
      });

      this.logger.debug('Chat completion created successfully');
      return completion as OpenAI.Chat.Completions.ChatCompletion;
    } catch (error) {
      this.logger.error('Failed to create chat completion', error);
      throw error;
    }
  }

  /**
   * Создает эмбеддинги для текста
   */
  async createEmbedding(
    input: string | string[],
    model: string = 'text-embedding-ada-002',
  ): Promise<OpenAI.Embeddings.CreateEmbeddingResponse> {
    try {
      this.logger.debug(`Creating embedding with model: ${model}`);

      const embedding = await this.openai.embeddings.create({
        model,
        input,
      });

      this.logger.debug(`Embedding created successfully`);
      return embedding;
    } catch (error) {
      this.logger.error('Failed to create embedding', error);
      throw error;
    }
  }

  /**
   * Генерирует изображение с помощью DALL-E
   */
  async generateImage(
    prompt: string,
    options?: Partial<OpenAI.Images.ImageGenerateParams>,
  ): Promise<OpenAI.Images.ImagesResponse> {
    try {
      this.logger.debug(`Generating image with prompt: ${prompt}`);

      const image = await this.openai.images.generate({
        prompt,
        n: 1,
        size: '1024x1024',
        ...options,
      });

      this.logger.debug('Image generated successfully');
      return image as OpenAI.Images.ImagesResponse;
    } catch (error) {
      this.logger.error('Failed to generate image', error);
      throw error;
    }
  }

  /**
   * Получает список доступных моделей
   */
  async listModels(): Promise<OpenAI.Models.ModelsPage> {
    try {
      this.logger.debug('Fetching available models');

      const models = await this.openai.models.list();

      this.logger.debug(`Fetched ${models.data.length} models`);
      return models;
    } catch (error) {
      this.logger.error('Failed to fetch models', error);
      throw error;
    }
  }

  /**
   * Получает прямой доступ к OpenAI клиенту для расширенного использования
   */
  getClient(): OpenAI {
    return this.openai;
  }
}
