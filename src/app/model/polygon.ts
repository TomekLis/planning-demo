import { LatLng } from '@agm/core';
import { Point } from '@agm/core/services/google-maps-types';

export class PolygonCell {
  shape: CellType;
  cellCenter: LatLng;
  vertices: LatLng[];

  constructor(shape: CellType, cellCenter: LatLng, vertices: LatLng[]) {
    this.shape = shape;
    this.cellCenter = cellCenter;
    this.vertices = vertices;
  }
}

export enum CellType {
  Triangular,
  Rectangular,
  Hexagonal
}
