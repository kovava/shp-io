import {Feature, FeatureCollection} from 'geojson';

export const getFeatureShapeType = (feature: Feature) => {
  switch (feature.geometry.type) {
    case 'Point':
      return 1;
    case 'MultiLineString':
    case 'LineString':
      return 3;
    case 'MultiPolygon':
    case 'Polygon':
      return 5;
    default:
      throw new Error(`Unsupported geometry type: ${feature.geometry.type}`);
  }
};

export const getFeatureCollectionShapeType = (
  featureCollection: FeatureCollection
) => {
  const types = new Set(
    featureCollection.features.map(f => getFeatureShapeType(f))
  );
  if (types.size > 1) {
    throw new Error('Mixed geometry types are not supported');
  }
  return types.values().next().value as number;
};
