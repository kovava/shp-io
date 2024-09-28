import {IBoundingBox} from './bounding-box';

export const createShpShxHeader = (shapeType: number) => {
  const header = Buffer.alloc(100);
  header.writeInt32BE(9994, 0); // File code
  header.writeInt32BE(0, 24); // File length (placeholder)
  header.writeInt32LE(1000, 28); // Version
  header.writeInt32LE(shapeType, 32); // Shape type
  header.writeDoubleLE(0, 36); // xMin (placeholder)
  header.writeDoubleLE(0, 44); // yMin (placeholder)
  header.writeDoubleLE(0, 52); // xMax (placeholder)
  header.writeDoubleLE(0, 60); // yMax (placeholder)
  return header;
};

export const updateHeaderFileSize = (header: Buffer, sizeInBytes: number) => {
  header.writeInt32BE(sizeInBytes / 2, 24);
  return header;
};

export const updateHeaderBoundingBox = (
  header: Buffer,
  overallBBox: IBoundingBox
) => {
  header.writeDoubleLE(overallBBox.xMin, 36);
  header.writeDoubleLE(overallBBox.yMin, 44);
  header.writeDoubleLE(overallBBox.xMax, 52);
  header.writeDoubleLE(overallBBox.yMax, 60);
  return header;
};
