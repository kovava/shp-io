import {
  FeatureCollection,
  Feature,
  Point,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
} from 'geojson';
import {Writable} from 'stream';
import {
  defaultBoundingBox,
  IBoundingBox,
  extendBoundingBox,
} from './bounding-box';
import {FileBuffer, getTotalFileSize, writeToStream} from './file-buffer';
import {shpWriteMultiPolygonRecord} from './shp-multi-polygon-record';
import {shpWriteMultiPolylineRecord} from './shp-multi-polyline-record';
import {shpWritePointRecord} from './shp-point-record';
import {shpWritePolygonRecord} from './shp-polygon-record';
import {shpWritePolylineRecord} from './shp-polyline-record';
import {
  createShpShxHeader,
  updateHeaderFileSize,
  updateHeaderBoundingBox,
} from './shp-shx-file-header';
import {shxWriteRecord} from './shx-record';
import {getFeatureCollectionShapeType} from './shape-type';

export const shpShxWrite = async (
  shpWritable: Writable,
  shxWritable: Writable,
  featureCollection: FeatureCollection
) => {
  const shpBuffer: FileBuffer = [];
  const shxBuffer: FileBuffer = [];

  const shapeType = getFeatureCollectionShapeType(featureCollection);

  const shpHeader = createShpShxHeader(shapeType);
  shpBuffer.push(shpHeader);

  const shxHeader = createShpShxHeader(shapeType);
  shxBuffer.push(shxHeader);

  let overallBBox = defaultBoundingBox();
  let recordOffset = 100; // file header size
  for (
    let recordIdx = 0;
    recordIdx < featureCollection.features.length;
    recordIdx++
  ) {
    const feature = featureCollection.features[recordIdx];
    let recordMetaData: {
      bbox: IBoundingBox;
      contentLength: number;
      headerLength: number;
    };
    switch (feature.geometry.type) {
      case 'Point':
        recordMetaData = shpWritePointRecord(
          shpBuffer,
          feature as Feature<Point>,
          recordIdx
        );
        break;
      case 'LineString':
        recordMetaData = shpWritePolylineRecord(
          shpBuffer,
          feature as Feature<LineString>,
          recordIdx
        );
        break;
      case 'MultiLineString':
        recordMetaData = shpWriteMultiPolylineRecord(
          shpBuffer,
          feature as Feature<MultiLineString>,
          recordIdx
        );
        break;
      case 'Polygon':
        recordMetaData = shpWritePolygonRecord(
          shpBuffer,
          feature as Feature<Polygon>,
          recordIdx
        );
        break;
      case 'MultiPolygon':
        recordMetaData = shpWriteMultiPolygonRecord(
          shpBuffer,
          feature as Feature<MultiPolygon>,
          recordIdx
        );
        break;
      default:
        throw new Error(`Unsupported geometry type: ${feature.geometry.type}`);
    }
    overallBBox = extendBoundingBox(overallBBox, recordMetaData.bbox);
    shxWriteRecord(shxBuffer, recordOffset, recordMetaData.contentLength);
    recordOffset += recordMetaData.contentLength + recordMetaData.headerLength;
  }

  updateHeaderFileSize(shpHeader, getTotalFileSize(shpBuffer));
  updateHeaderBoundingBox(shpHeader, overallBBox);

  updateHeaderFileSize(shxHeader, getTotalFileSize(shxBuffer));
  updateHeaderBoundingBox(shxHeader, overallBBox);

  await writeToStream(shpBuffer, shpWritable);
  await writeToStream(shxBuffer, shxWritable);
};
