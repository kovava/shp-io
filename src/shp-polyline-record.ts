import {LineString, Position} from 'geojson';
import {FileBuffer} from './file-buffer';
import {getFeatureShapeType} from './shape-type';
import {shpWriteShapeRecord} from './shp-record';

export const shpWritePolylineRecord = (
  buffer: FileBuffer,
  feature: GeoJSON.Feature<LineString>,
  recordIndex: number
) => {
  const parts: Array<number> = [0];
  const points: Array<Position> = [...feature.geometry.coordinates];

  return shpWriteShapeRecord(
    buffer,
    getFeatureShapeType(feature),
    parts,
    points,
    recordIndex
  );
};
