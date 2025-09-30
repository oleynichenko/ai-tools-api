import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  async saveResponse(response: any, filePrefix: string): Promise<void> {
    try {
      const logsDir = 'logs';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `openai-response-${filePrefix}-${timestamp}.json`;
      const filePath = path.join(logsDir, fileName);

      await fs.mkdir(logsDir, { recursive: true });

      await fs.writeFile(filePath, JSON.stringify(response, null, 2), 'utf-8');

      this.logger.debug(`Response saved to ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to save response to file', error);
    }
  }
}
