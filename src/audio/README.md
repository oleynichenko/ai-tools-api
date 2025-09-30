# Audio Analysis Module

Модуль для анализа аудиофайлов с использованием OpenAI Whisper API для транскрипции и GPT для классификации эмоций и тем.

## Функциональность

Модуль позволяет загружать аудиофайлы и автоматически:

1. **Транскрибировать** аудио в текст с помощью OpenAI Whisper
2. **Классифицировать** содержание по категориям:
   - **Темы**: Workload, Team, Meetings, Conflict, Time Management, Leadership, Well-being
   - **Эмоции**: Fatigue, Satisfaction, Frustration, Anxiety, Relief, Uncertainty, Motivation
   - **Теги**: Короткие ключевые слова, описывающие содержание
3. **Оценить уверенность** в классификации (0.0 - 1.0)

## Поддерживаемые форматы

Модуль поддерживает следующие аудиоформаты:

- **MP3** (.mp3) - MPEG Audio Layer 3
- **WAV** (.wav) - Waveform Audio File Format
- **FLAC** (.flac) - Free Lossless Audio Codec
- **M4A** (.m4a) - MPEG-4 Audio
- **OGG** (.ogg) - Ogg Vorbis
- **WebM** (.webm) - WebM Audio
- **AAC** (.aac) - Advanced Audio Coding
- **WMA** (.wma) - Windows Media Audio

## API Endpoints

### POST /audio/analyse-audio

Анализирует аудиофайл и возвращает структурированные данные с транскрипцией и классификацией.

**Параметры:**

- `file` - аудиофайл (multipart/form-data)
- Максимальный размер файла: 25MB (ограничение OpenAI Whisper)
- Поддерживаемые форматы: см. список выше

**Пример запроса:**

```bash
curl -X POST http://localhost:3000/audio/analyse-audio \
  -F "file=@meeting_recording.mp3"
```

**Пример ответа:**

```json
{
  "transcription": "I'm feeling really overwhelmed with the current workload. The team meeting yesterday didn't go well and there's a lot of conflict about the project timeline.",
  "topic": ["Workload", "Team"],
  "emotion": ["Frustration", "Anxiety"],
  "tags": [
    "burnout_warning",
    "workload_concern",
    "team_conflict",
    "timeline_stress",
    "needs_support"
  ]
}
```

## Детали классификации

### 🔹 Темы (Topic)

Выбирается 1-2 основные темы из списка:

- **Workload** - рабочая нагрузка, объем задач
- **Team** - командная работа, взаимодействие в коллективе
- **Meetings** - встречи, совещания
- **Conflict** - конфликты, разногласия
- **Time Management** - управление временем, планирование
- **Leadership** - лидерство, управление
- **Well-being** - благополучие, самочувствие

### 🔹 Эмоции (Emotion)

Может быть выбрано несколько эмоций:

- **Fatigue** - усталость, истощение
- **Satisfaction** - удовлетворение, довольство
- **Frustration** - фрустрация, раздражение
- **Anxiety** - тревога, беспокойство
- **Relief** - облегчение, успокоение
- **Uncertainty** - неопределенность, сомнения
- **Motivation** - мотивация, энтузиазм

### 🔹 Теги (Tags)

3-10 коротких тегов, описывающих содержание. Примеры:

- `burnout_warning` - предупреждение о выгорании
- `task_completion` - завершение задач
- `team_conflict` - конфликт в команде
- `needs_support` - нужна поддержка
- `motivation_spike` - всплеск мотивации
- `missed_deadline` - пропущенный дедлайн
- `workload_concern` - беспокойство о нагрузке
- `positive_feedback` - положительная обратная связь
- `stress_indicator` - индикатор стресса
- `productivity_boost` - повышение продуктивности

## Использование в коде

```typescript
import { AudioService } from './audio/audio.service';

@Injectable()
export class YourService {
  constructor(private readonly audioService: AudioService) {}

  async processAudioFile(audioBuffer: Buffer, filename: string) {
    return this.audioService.analyzeAudio(audioBuffer, filename);
  }

  // Проверка поддерживаемых форматов
  checkFormat(mimeType: string): boolean {
    return this.audioService.isFormatSupported(mimeType);
  }

  // Получение списка поддерживаемых форматов
  getSupportedFormats(): string[] {
    return this.audioService.getSupportedFormats();
  }
}
```

## Требования

- OpenAI API ключ должен быть установлен в переменной окружения `OPENAI_API_KEY`
- Используется модель `whisper-1` для транскрипции
- Используется модель `gpt-4o-mini` для классификации
- Node.js с поддержкой File API (для работы с Whisper API)

## Ограничения

- Максимальный размер файла: 25MB (ограничение OpenAI Whisper)
- Поддерживается только английский язык для транскрипции (можно настроить)
- Время обработки зависит от длительности аудио и загрузки OpenAI API

## Обработка ошибок

- `400 Bad Request` - если файл не загружен, имеет неверный формат или слишком большой размер
- `400 Bad Request` - если не удалось транскрибировать или классифицировать аудио
- `400 Bad Request` - если расширение файла не соответствует MIME-типу
- `500 Internal Server Error` - при ошибках OpenAI API

## Логирование

Модуль ведет подробное логирование:

- Начало и завершение процесса анализа
- Результаты транскрипции (первые 100 символов)
- Результаты классификации
- Ошибки на всех этапах обработки

Все ответы от OpenAI сохраняются в файлы для отладки через `FileService`.

## Примеры использования

### Анализ записи совещания

```bash
curl -X POST http://localhost:3000/audio/analyse-audio \
  -F "file=@team_meeting.wav"
```

### Анализ голосовой заметки о работе

```bash
curl -X POST http://localhost:3000/audio/analyse-audio \
  -F "file=@work_note.m4a"
```

### Анализ аудиофидбека

```bash
curl -X POST http://localhost:3000/audio/analyse-audio \
  -F "file=@feedback_session.flac"
```
