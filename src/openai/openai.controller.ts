import { Controller, Post, Body, Get } from '@nestjs/common';
import { OpenAiService } from './openai.service';

export class ChatCompletionDto {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
}

export class EmbeddingDto {
  input: string | string[];
  model?: string;
}

export class ImageGenerationDto {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
}

@Controller('openai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @Post('chat/completions')
  async createChatCompletion(@Body() dto: ChatCompletionDto) {
    return this.openAiService.createChatCompletion(dto.messages, dto.model);
  }

  @Post('embeddings')
  async createEmbedding(@Body() dto: EmbeddingDto) {
    return this.openAiService.createEmbedding(dto.input, dto.model);
  }

  @Post('images/generations')
  async generateImage(@Body() dto: ImageGenerationDto) {
    return this.openAiService.generateImage(dto.prompt, {
      size: dto.size,
      n: dto.n,
    });
  }

  @Get('models')
  async listModels() {
    return this.openAiService.listModels();
  }
}
