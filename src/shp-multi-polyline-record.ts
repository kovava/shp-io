import {MultiLineString, Position} from 'geojson';
import {shpWriteShapeRecord} from './shp-record';
import {FileBuffer} from './file-buffer';
import {getFeatureShapeType} from './shape-type';

export const shpWriteMultiPolylineRecord = (
  buffer: FileBuffer,
  feature: GeoJSON.Feature<MultiLineString>,
  recordIndex: number
) => {
  const parts: Array<number> = [];
  const points: Array<Position> = [];
  for (const ring of feature.geometry.coordinates) {
    parts.push(points.length);
    points.push(...ring);
  }

  return shpWriteShapeRecord(
    buffer,
    getFeatureShapeType(feature),
    parts,
    points,
    recordIndex
  );
};
