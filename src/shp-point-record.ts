import {Point} from 'geojson';
import {FileBuffer} from './file-buffer';
import {shpWriteRecordHeader} from './shp-record';
import {getFeatureShapeType} from './shape-type';
import {getBoundingBox} from './bounding-box';

export const shpWritePointRecord = (
  buffer: FileBuffer,
  feature: GeoJSON.Feature<Point>,
  recordIndex: number
) => {
  const contentLength = 20; // 4 bytes for shape type + 16 bytes for x and y
  const headerLength = shpWriteRecordHeader(buffer, contentLength, recordIndex);

  const recordContent = Buffer.alloc(contentLength);
  recordContent.writeInt32LE(getFeatureShapeType(feature), 0);
  const [x, y] = feature.geometry.coordinates;
  recordContent.writeDoubleLE(x, 4);
  recordContent.writeDoubleLE(y, 12);
  buffer.push(recordContent);

  return {
    bbox: getBoundingBox([feature.geometry.coordinates]),
    contentLength,
    headerLength,
  };
};
