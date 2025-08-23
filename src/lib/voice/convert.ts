import prism from 'prism-media';
import { Readable } from 'stream';

/**
 * Convert Discord voice audio stream to Whisper compatible format
 * @param audioStream Discord audio stream
 * @returns Converted audio stream
 */
async function convertDiscordAudioToMP3(
  audioStream: Readable
): Promise<Readable> {
  const converter = new prism.FFmpeg({
    args: [
      '-f',
      's16le', // Input: 16-bit PCM little-endian
      '-ar',
      '16000', // Input sample rate 16kHz
      '-ac',
      '1', // Input: mono channel
      '-acodec',
      'libmp3lame', // Output codec: MP3
      '-b:a',
      '128k', // MP3 bitrate 128kbps
      '-ar',
      '16000', // Output sample rate (maintain 16kHz)
      '-ac',
      '1', // Output: mono channel
      '-f',
      'mp3', // Output format: MP3
    ],
  });

  return audioStream.pipe(converter);
}
