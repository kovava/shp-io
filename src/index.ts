import {Writable} from 'stream';
import {FeatureCollection} from 'geojson';
import {dbfWrite} from './dbf-file';
import {shpShxWrite} from './shp-shx-file';

export const shpWrite = async (
  featureCollection: FeatureCollection,
  shpWritable: Writable,
  shxWritable: Writable,
  dbfWritable: Writable
) => {
  if (!featureCollection?.features?.length)
    throw new Error('Invalid or empty FeatureCollection');

  await shpShxWrite(shpWritable, shxWritable, featureCollection);
  await dbfWrite(dbfWritable, featureCollection);
};
