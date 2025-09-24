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
import { ReceiptService } from './receipt.service';
import { ReceiptResponseDto } from './dto/receipt-response.dto';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('parse-receipt')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Проверяем тип файла
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async parseReceipt(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ReceiptResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.buffer) {
      throw new BadRequestException('File buffer is empty');
    }

    if (file.size === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    try {
      return await this.receiptService.parseReceipt(file.buffer, file.mimetype);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
