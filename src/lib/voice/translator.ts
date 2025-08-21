import whisper from '@kutalia/whisper-node-addon';
import prism from 'prism-media';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import os from 'os';
import { randomUUID } from 'crypto';

async function transcribeWithPrism(inputFile: string, outputModel: string) {
  const stream = fs.createReadStream(inputFile).pipe(
    new prism.FFmpeg({
      args: ['-f', 's16le', '-ar', '16000', '-ac', '1'],
    })
  );

  const tempFile = path.join(os.tmpdir(), `whisper_${randomUUID()}.wav`);
  const writeStream = fs.createWriteStream(tempFile);

  try {
    await pipeline(stream, writeStream);

    const result = await whisper.transcribe({
      fname_inp: tempFile,
      model: outputModel,
      language: 'auto',
      use_gpu: true,
    });

    return result;
  } finally {
    setImmediate(async () => {
      try {
        await fs.promises.unlink(tempFile);
      } catch (err) {
        console.warn(`Clean temp file failed:`, err);
      }
    });
  }
}

export { transcribeWithPrism };
