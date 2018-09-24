import { LatLng } from '@agm/core';
import { Point } from '@agm/core/services/google-maps-types';

export class PolygonCell {
  shape: CellType;
  cellCenter: LatLng;
  vertices: Point[];

  constructor(shape: CellType, cellCenter: LatLng) {
    this.shape = shape;
    this.cellCenter = cellCenter;
    this.vertices = [];
  }
}

export enum CellType {
  Triangular,
  Rectangular,
  Hexagonal
}
