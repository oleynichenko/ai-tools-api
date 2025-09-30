import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAiModule } from './openai/openai.module';
import { ReceiptModule } from './receipt/receipt.module';
import { AudioModule } from './audio/audio.module';
import openaiConfig from './config/openai.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [openaiConfig],
    }),
    OpenAiModule,
    ReceiptModule,
    AudioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
