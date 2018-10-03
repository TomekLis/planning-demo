import { CellType } from './polygon';

export class PolygonCharacteristics {
  offset: number;
  step: number;
  fillingOffset: number;
  polygonType: CellType;
  distanceBetweenCells: (size: number) => number;
  distanceFromCenterFunction: (size: number) => number;
  fillingCellNumber: (level: number) => number;

  constructor(cellType: CellType) {
    this.polygonType = cellType;
    switch (cellType) {
      case CellType.Hexagonal:
        this.offset = 30;
        this.step = 60;
        this.fillingOffset = 120;
        this.distanceFromCenterFunction = size => size * Math.sqrt(3);
        this.distanceBetweenCells = this.distanceFromCenterFunction;
        this.fillingCellNumber = (level: number) => level;
        break;
      case CellType.Rectangular:
        this.offset = 45;
        this.step = 90;
        this.fillingOffset = 135;
        this.distanceFromCenterFunction = size => 2 * size;
        this.distanceBetweenCells = size => size * Math.sqrt(2);
        this.fillingCellNumber = (level: number) => 2 + (level * 2 - 2);
        // Math.sqrt(2);
        break;
      default:
        break;
    }
  }
}
