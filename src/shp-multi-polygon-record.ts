import {MultiPolygon, Position} from 'geojson';
import {FileBuffer} from './file-buffer';
import {getFeatureShapeType} from './shape-type';
import {shpWriteShapeRecord} from './shp-record';

export const shpWriteMultiPolygonRecord = (
  buffer: FileBuffer,
  feature: GeoJSON.Feature<MultiPolygon>,
  recordIndex: number
) => {
  const parts: Array<number> = [];
  const points: Array<Position> = [];

  for (const polygon of feature.geometry.coordinates) {
    for (const ring of polygon) {
      parts.push(points.length);
      points.push(...ring);
    }
  }

  return shpWriteShapeRecord(
    buffer,
    getFeatureShapeType(feature),
    parts,
    points,
    recordIndex
  );
};
