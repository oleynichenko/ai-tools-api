import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AudioService } from './audio.service';
import { AudioAnalysisResponseDto } from './dto/audio-analysis-response.dto';
import {
  SUPPORTED_MIME_TYPES,
  SUPPORTED_FORMATS,
} from './constants/audio-formats.constants';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('analyse-audio')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, callback) => {
        // Check file type - validate supported audio formats
        if (
          !(SUPPORTED_MIME_TYPES as readonly string[]).includes(file.mimetype)
        ) {
          return callback(
            new BadRequestException(
              `Only audio files are allowed. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async analyseAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AudioAnalysisResponseDto> {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    if (!file.buffer) {
      throw new BadRequestException('Audio file buffer is empty');
    }

    if (file.size === 0) {
      throw new BadRequestException('Uploaded audio file is empty');
    }

    // Additional validation for file size (Whisper has limits)
    const maxSizeForWhisper = 2 * 1024 * 1024; // 2MB

    if (file.size > maxSizeForWhisper) {
      throw new BadRequestException(
        'Audio file too large. Maximum size is 2MB for transcription.',
      );
    }

    try {
      return await this.audioService.analyzeAudio(
        file.buffer,
        file.originalname,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
