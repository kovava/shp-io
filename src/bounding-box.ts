import {Position} from 'geojson';

export interface IBoundingBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export const defaultBoundingBox = (): IBoundingBox => ({
  xMin: Infinity,
  yMin: Infinity,
  xMax: -Infinity,
  yMax: -Infinity,
});

export const getBoundingBox = (points: Array<Position>): IBoundingBox => {
  const bb = defaultBoundingBox();
  for (const [x, y] of points) {
    bb.xMin = Math.min(bb.xMin, x);
    bb.yMin = Math.min(bb.yMin, y);
    bb.xMax = Math.max(bb.xMax, x);
    bb.yMax = Math.max(bb.yMax, y);
  }
  return bb;
};

export const extendBoundingBox = (
  boundingBox: IBoundingBox,
  otherBoundingBox: IBoundingBox
): IBoundingBox => ({
  xMin: Math.min(boundingBox.xMin, otherBoundingBox.xMin),
  yMin: Math.min(boundingBox.yMin, otherBoundingBox.yMin),
  xMax: Math.max(boundingBox.xMax, otherBoundingBox.xMax),
  yMax: Math.max(boundingBox.yMax, otherBoundingBox.yMax),
});
