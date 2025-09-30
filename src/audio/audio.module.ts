import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { OpenAiModule } from '../openai/openai.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [OpenAiModule, FileModule],
  controllers: [AudioController],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}
