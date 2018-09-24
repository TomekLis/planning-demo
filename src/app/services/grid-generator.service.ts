import { Injectable } from '@angular/core';
import { Grid } from '../model/grid';
import { CellType, PolygonCell } from '../model/polygon';
import { AgmPolygon, LatLng, LatLngBounds } from '@agm/core';
import { PolygonService } from './polygon.service';
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GridGeneratorService {
  sphericalApi: any;
  constructor() {}
  /**
   * GenerateGrid
   */
  public GenerateGrid(
    gridType: CellType,
    areaVertices: LatLng[],
    cellSize: number
  ): Grid {
    this.sphericalApi = google.maps.geometry.spherical;
    const polygonBounds = new google.maps.LatLngBounds();

    areaVertices.forEach(polygonCoord => {
      polygonBounds.extend(polygonCoord);
    });

    const areaCenter = this.getAreaCenter(polygonBounds);

    const furthestPointDistance = this.getFarthestPoint(
      areaVertices,
      areaCenter
    );

    const numOfLevels = this.getNumberOfLevels(furthestPointDistance, cellSize);

    const centerPoints = this.getCenterPoints(
      numOfLevels,
      areaCenter,
      cellSize
    );

    const grid: Grid = new Grid();
    centerPoints.forEach(centerPoint => {
      const newPolygonCell = this.generateCell(centerPoint, cellSize);
      grid.cells.push(newPolygonCell);
    });
    return grid;
  }
  generateCell(centerPoint: LatLng, size: number): PolygonCell {
    const polygonCell: PolygonCell = new PolygonCell(
      CellType.Hexagonal,
      centerPoint
    );
    for (let heading = 0; heading < 360; heading += 60) {
      polygonCell.vertices.push(
        this.sphericalApi.computeOffset(centerPoint, size, heading)
      );
    }
    return polygonCell;
  }
  getNumberOfLevels(furthestPointDistance: number, cellSize: number): number {
    return Math.ceil(furthestPointDistance / (cellSize * Math.sqrt(3)));
  }
  getFarthestPoint(areaVertices: LatLng[], areaCenter: LatLng): number {
    return Math.max.apply(
      Math,
      areaVertices.map(path => {
        return this.sphericalApi.computeDistanceBetween(areaCenter, path);
      })
    );
  }
  private getAreaCenter(polygonBounds: LatLngBounds): LatLng {
    return polygonBounds.getCenter();
  }

  private getCenterPoints(
    numOfLevels: number,
    centerPoint: LatLng,
    size: number
  ): LatLng[] {
    const cellCenters: LatLng[] = [];
    cellCenters.push(centerPoint);
    if (numOfLevels <= 1) {
      return cellCenters;
    }
    const sphericalApi = google.maps.geometry.spherical;

    const distanceFromCenter = size * Math.sqrt(3);
    let currentLevel = 0;
    while (currentLevel < numOfLevels - 1) {
      for (let heading = 30; heading < 360; heading += 60) {
        let newPoint = sphericalApi.computeOffset(
          centerPoint,
          distanceFromCenter * (currentLevel + 1),
          heading
        );
        cellCenters.push(newPoint);
        for (let index = 1; index <= currentLevel; index++) {
          newPoint = sphericalApi.computeOffset(
            newPoint,
            distanceFromCenter,
            heading + 120
          );
          cellCenters.push(newPoint);
        }
      }
      currentLevel++;
    }
    return cellCenters;
  }
}
