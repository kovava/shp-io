import {Position} from 'geojson';
import {FileBuffer} from './file-buffer';
import {getBoundingBox} from './bounding-box';

export const shpWriteRecordHeader = (
  buffer: FileBuffer,
  contentLength: number,
  recordIndex: number
) => {
  const headerLength = 8;
  const recordHeader = Buffer.alloc(headerLength);
  recordHeader.writeInt32BE(recordIndex + 1, 0);
  recordHeader.writeInt32BE(contentLength / 2, 4);
  buffer.push(recordHeader);
  return headerLength;
};

export const shpWriteShapeRecord = (
  buffer: FileBuffer,
  shapeType: number,
  parts: Array<number>,
  points: Array<Position>,
  recordIndex: number
) => {
  const bbox = getBoundingBox(points);
  const contentLength = 44 + 4 * parts.length + 16 * points.length;

  const headerLength = shpWriteRecordHeader(buffer, contentLength, recordIndex);

  const recordContent = Buffer.alloc(contentLength);
  recordContent.writeInt32LE(shapeType, 0);
  recordContent.writeDoubleLE(bbox.xMin, 4);
  recordContent.writeDoubleLE(bbox.yMin, 12);
  recordContent.writeDoubleLE(bbox.xMax, 20);
  recordContent.writeDoubleLE(bbox.yMax, 28);
  recordContent.writeInt32LE(parts.length, 36);
  recordContent.writeInt32LE(points.length, 40);

  let offset = 44;
  parts.forEach(pointIndex => {
    recordContent.writeInt32LE(pointIndex, offset);
    offset += 4;
  });

  points.forEach(([x, y]) => {
    recordContent.writeDoubleLE(x, offset);
    offset += 8;
    recordContent.writeDoubleLE(y, offset);
    offset += 8;
  });
  buffer.push(recordContent);

  return {bbox, contentLength, headerLength};
};
