import whisper from '@kutalia/whisper-node-addon';
import prism from 'prism-media';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import os from 'os';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

/**
 * Whisper transcription options interface
 */
interface WhisperOptions {
  model?: string;
  language?: string;
  useGpu?: boolean;
}

/**
 * Transcription result interface - matches actual library output
 */
interface TranscriptionResult {
  transcription: string[] | string[][];
}

/**
 * Formatted transcription result
 */
interface FormattedTranscriptionResult {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  language?: string;
}

/**
 * Discord voice stream transcriber
 * Converts Discord Opus audio streams to text
 *
 * @param audioStream Discord audio stream (Opus format)
 * @param options Whisper transcription options
 * @returns Transcription result
 * @throws {Error} When transcription process fails
 */
async function transcribeDiscordVoice(
  audioStream: Readable,
  options: WhisperOptions = {}
): Promise<FormattedTranscriptionResult> {
  const {
    model = 'ggml-base.en.bin',
    language = 'en',
    useGpu = false,
  } = options;

  // Validate input parameters
  if (!audioStream || typeof audioStream.pipe !== 'function') {
    throw new Error('Invalid audio stream provided');
  }

  const tempFile = path.join(
    os.tmpdir(),
    `discord_whisper_${randomUUID()}.wav`
  );

  let converter: prism.FFmpeg | null = null;
  let writeStream: fs.WriteStream | null = null;

  try {
    // Create FFmpeg converter: Opus -> 16kHz PCM
    converter = new prism.FFmpeg({
      args: [
        '-f',
        'opus', // Discord uses Opus encoding
        '-ar',
        '48000', // Discord sample rate 48kHz
        '-ac',
        '2', // Stereo input
        '-f',
        'wav', // Output WAV format
        '-ar',
        '16000', // Whisper requires 16kHz
        '-ac',
        '1', // Convert to mono
      ],
    });

    writeStream = fs.createWriteStream(tempFile);

    // Audio conversion pipeline
    await pipeline(audioStream, converter, writeStream);

    // Verify temporary file exists and has content
    const stats = await fs.promises.stat(tempFile);
    if (stats.size === 0) {
      throw new Error('Audio stream is empty or conversion failed');
    }

    console.log(
      `Starting transcription of audio file (${(stats.size / 1024).toFixed(1)} KB)`
    );

    // Execute Whisper transcription with correct parameters
    const result: TranscriptionResult = await whisper.transcribe({
      fname_inp: tempFile,
      model,
      language,
      use_gpu: useGpu,
    });

    console.log('Transcription completed successfully');

    // Format the result to a more usable format
    const formattedResult: FormattedTranscriptionResult = {
      text: Array.isArray(result.transcription)
        ? result.transcription.flat().join(' ')
        : String(result.transcription),
      language,
    };

    return formattedResult;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw new Error(
      `Discord voice transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    // Clean up resources
    converter?.destroy();
    writeStream?.destroy();

    // Asynchronous cleanup of temporary file
    setImmediate(async () => {
      try {
        await fs.promises.access(tempFile);
        await fs.promises.unlink(tempFile);
        console.log('Temporary file cleaned up');
      } catch (err) {
        // Ignore file not found errors
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.warn('Temporary file cleanup failed:', err);
        }
      }
    });
  }
}

/**
 * Batch transcribe multiple audio streams
 * @param audioStreams Array of audio streams
 * @param options Transcription options
 * @returns Array of transcription results
 */
async function transcribeMultipleStreams(
  audioStreams: Readable[],
  options: WhisperOptions = {}
): Promise<FormattedTranscriptionResult[]> {
  const results = await Promise.allSettled(
    audioStreams.map((stream) => transcribeDiscordVoice(stream, options))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Stream ${index} transcription failed:`, result.reason);
      return { text: '', language: 'unknown' };
    }
  });
}

export {
  transcribeDiscordVoice,
  transcribeMultipleStreams,
  type WhisperOptions,
  type FormattedTranscriptionResult as TranscriptionResult,
};
