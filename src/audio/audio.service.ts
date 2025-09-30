import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';
import { AudioAnalysisResponseDto } from './dto/audio-analysis-response.dto';
import { FileService } from '../file/file.service';
import {
  SUPPORTED_MIME_TYPES,
  SUPPORTED_FORMATS,
  MIME_TYPE_MAP,
} from './constants/audio-formats.constants';

interface ParsedAudioAnalysisResults {
  topic: string[];
  emotion: string[];
  tags: string[];
}

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly fileService: FileService,
  ) {}

  async analyzeAudio(
    audioBuffer: Buffer,
    originalName: string,
  ): Promise<AudioAnalysisResponseDto> {
    try {
      this.logger.debug('Starting audio analysis with OpenAI Whisper and GPT');

      // First, transcribe the audio using Whisper
      const transcription = await this.transcribeAudio(
        audioBuffer,
        originalName,
      );

      if (!transcription.trim()) {
        throw new Error('No transcription received from audio');
      }

      this.logger.debug(
        `Transcription completed: ${transcription.substring(0, 100)}...`,
      );

      // Then, analyze the transcription for classification
      const analysis = await this.classifyTranscription(transcription);

      const result: AudioAnalysisResponseDto = {
        transcription,
        topic: analysis.topic,
        emotion: analysis.emotion,
        tags: analysis.tags,
      };

      this.logger.debug('Audio analysis completed successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to analyze audio', error);
      throw new Error(`Audio analysis failed: ${error.message}`);
    }
  }

  private async transcribeAudio(
    audioBuffer: Buffer,
    originalName: string,
  ): Promise<string> {
    try {
      const openaiClient = this.openAiService.getClient();

      // Create a File object for OpenAI API (Node.js 18+ support)
      const audioFile = new File([new Uint8Array(audioBuffer)], originalName, {
        type: this.getMimeTypeFromExtension(originalName),
      });

      const transcription = await openaiClient.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'text',
      });

      return transcription;
    } catch (error) {
      this.logger.error('Failed to transcribe audio', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  private async classifyTranscription(
    transcription: string,
  ): Promise<ParsedAudioAnalysisResults> {
    const prompt = `
Analyze the following transcribed audio text and classify it according to the specified categories.

Text to analyze: "${transcription}"

Classify according to the following categories:

🔹 1. Topic – What is the sentence about?
If nothing fits, choose one or two of the following options, but if nothing fits, come up with your own topic:
- Workload
- Team
- Meetings
- Conflict
- Time Management
- Leadership
- Well-being

🔹 2. Emotion – What emotions are expressed?
Choose one or more of the following but if nothing fits, come up with your own emotion:
- Fatigue
- Satisfaction
- Frustration
- Anxiety
- Relief
- Uncertainty
- Motivation

🔹 3. Tags – Add short tags (keywords) summarizing the message
Choose or invent up to 10 short tags from examples like:
burnout_warning, task_completion, team_conflict, needs_support, motivation_spike, missed_deadline, workload_concern, positive_feedback, stress_indicator, productivity_boost


Return in this exact JSON format:
{
  "topic": ["Topic1", "Topic2"],
  "emotion": ["Emotion1", "Emotion2"],
  "tags": ["tag1", "tag2", "tag3"],
}

Important:
- Topic array should contain 1-2 items maximum
- Emotion array can contain multiple items
- Tags array should contain 3-10 relevant tags
- All values must be from the specified categories or follow the tag naming pattern
- Return ONLY valid JSON without any code fences or explanations
- If the transcribed audio text does not contain information similar to a meeting recording, return an appropriate message as a string.  
`;

    try {
      const response = await this.openAiService.createChatCompletion(
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        'gpt-4o-mini',
      );

      // Save the response for debugging
      await this.fileService.saveResponse(response, 'audio');

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error('No content received from OpenAI classification');
      }

      this.logger.debug(`Classification response: ${content}`);

      // Parse JSON response
      let parsedResult: ParsedAudioAnalysisResults;

      try {
        parsedResult = JSON.parse(content);
      } catch {
        // Try to extract JSON from text if it's wrapped
        const jsonMatch = content.match(/\{[\s\S]*}/);

        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(
            'Unable to parse classification data from OpenAI response',
          );
        }
      }

      // Validate and normalize the result
      this.validateClassificationData(parsedResult);

      return parsedResult;
    } catch (error) {
      this.logger.error('Failed to classify transcription', error);
      throw new Error(`Classification failed: ${error.message}`);
    }
  }

  private validateClassificationData(data: ParsedAudioAnalysisResults): void {
    if (!data) {
      throw new Error('Invalid audio classification data structure');
    }

    if (typeof data !== 'object') {
      throw new Error(data);
    }

    // Validate topic
    if (!Array.isArray(data.topic) || !data.topic.length) {
      throw new Error('Topic must be an array with 1-2 items');
    }

    // Validate emotion
    if (!Array.isArray(data.emotion) || !data.emotion.length) {
      throw new Error('Emotion must be a non-empty array');
    }

    // Validate tags
    if (!Array.isArray(data.tags) || !data.tags.length) {
      throw new Error('Tags must be an array with 3-10 items');
    }
  }

  private getMimeTypeFromExtension(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    return MIME_TYPE_MAP[extension || ''] || 'audio/mpeg';
  }

  /**
   * Get supported audio formats for validation
   */
  getSupportedFormats(): string[] {
    return [...SUPPORTED_FORMATS];
  }

  /**
   * Check if file format is supported
   */
  isFormatSupported(mimeType: string): boolean {
    return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
  }
}
