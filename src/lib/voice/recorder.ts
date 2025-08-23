import prism from 'prism-media';
import { Readable, pipeline, Writable } from 'stream';
import { promisify } from 'util';

/**
 * Record audio from a Discord voice stream for a specified duration
 * and convert it to 16kHz mono PCM format.
 * @param audioStream Readable stream from Discord voice connection
 * @param duration Duration to record in milliseconds (default: 5000ms)
 * @returns Promise that resolves to a Buffer containing the recorded audio data
 */

const pipelineAsync = promisify(pipeline);

export async function recordDiscordVoice(
  audioStream: Readable,
  duration: number = 5000
): Promise<Buffer> {
  const converter = new prism.FFmpeg({
    args: [
      '-f',
      'opus',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-f',
      's16le',
      '-ar',
      '16000',
      '-ac',
      '1',
    ],
  });

  const chunks: Buffer[] = [];
  const writableStream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  try {
    // Set up timeout control
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        audioStream.destroy();
        converter.destroy();
        writableStream.destroy();
        resolve();
      }, duration);
    });

    // Wait for either timeout or pipeline completion
    await Promise.race([
      pipelineAsync(audioStream, converter, writableStream),
      timeoutPromise,
    ]);

    return Buffer.concat(chunks);
  } catch (error) {
    // Clean up resources
    [audioStream, converter, writableStream].forEach((stream) => {
      if (stream && !stream.destroyed) {
        stream.destroy();
      }
    });

    throw error;
  }
}
