import {Writable} from 'stream';

export type FileBuffer = Array<Buffer>;

export const getTotalFileSize = (buffer: FileBuffer) => {
  return buffer.reduce((acc, curr) => acc + curr.length, 0);
};

export const writeToStream = async (buffer: FileBuffer, writable: Writable) => {
  for (const chunk of buffer) {
    await safeWrite(writable, chunk);
  }
  writable.end();
};

const safeWrite = async (writable: Writable, buffer: Buffer) => {
  if (!writable.write(buffer)) {
    await new Promise(resolve => writable.once('drain', resolve));
  }
};
