import fs from 'fs/promises';
import path from 'path';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';

/**
 * Save audio buffer to file
 * @param buffer Audio buffer
 * @param filepath Directory path to save the file
 * @param filename Name of the file without extension
 * @param filetype File extension (mp3 or pcm)
 * @returns Full path of the saved file
 */
const pipelineAsync = promisify(pipeline);

export async function saveAudioBufferStream(
  buffer: Buffer,
  filepath: string,
  filename: string,
  filetype: 'mp3' | 'pcm'
): Promise<string> {
  try {
    await fs.mkdir(filepath, { recursive: true });

    const fullPath = path.join(filepath, `${filename}.${filetype}`);
    const readable = Readable.from(buffer);
    const { createWriteStream } = await import('fs');
    const writeStream = createWriteStream(fullPath);

    await pipelineAsync(readable, writeStream);

    console.log(`Audio saved to ${fullPath} (${buffer.length} bytes)`);
    return fullPath;
  } catch (error) {
    console.error('Save audio failed:', error);
    throw error;
  }
}
