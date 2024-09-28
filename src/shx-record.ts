import {FileBuffer} from './file-buffer';

export const shxWriteRecord = (
  buffer: FileBuffer,
  offset: number,
  contentLength: number
) => {
  const shxRecord = Buffer.alloc(8);
  shxRecord.writeInt32BE(offset / 2, 0);
  shxRecord.writeInt32BE(contentLength / 2, 4);
  buffer.push(shxRecord);
};
