import {Polygon, Position} from 'geojson';
import {FileBuffer} from './file-buffer';
import {getFeatureShapeType} from './shape-type';
import {shpWriteShapeRecord} from './shp-record';

export const shpWritePolygonRecord = (
  buffer: FileBuffer,
  feature: GeoJSON.Feature<Polygon>,
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
