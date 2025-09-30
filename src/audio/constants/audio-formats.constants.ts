/**
 * Audio format constants shared across the audio module
 */

export const SUPPORTED_MIME_TYPES = [
  'audio/mpeg', // mp3
  'audio/wav', // wav
  'audio/flac', // flac
  'audio/mp4', // m4a
  'audio/ogg', // ogg
  'audio/webm', // webm
  'audio/aac', // aac
  'audio/x-ms-wma', // wma
] as const;

export const SUPPORTED_FORMATS = [
  'mp3',
  'wav',
  'flac',
  'm4a',
  'ogg',
  'webm',
  'aac',
  'wma',
] as const;

export const MIME_TYPE_MAP: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
  aac: 'audio/aac',
  wma: 'audio/x-ms-wma',
} as const;
