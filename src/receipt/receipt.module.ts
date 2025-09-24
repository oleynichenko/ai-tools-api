import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { OpenAiModule } from '../openai/openai.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [OpenAiModule, FileModule],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
