import { Injectable } from '@angular/core';
import { Grid } from '../model/grid';
import { CellType, PolygonCell } from '../model/polygon';
import { AgmPolygon, LatLng, LatLngBounds } from '@agm/core';
import { PolygonService } from './polygon.service';
import { PolygonCharacteristics } from '../model/polygon-charatcteristics';
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GridGeneratorService {
  sphericalApi: any;
  constructor(private polygonService: PolygonService) {}

  public GenerateGrid(
    gridType: CellType,
    areaVertices: LatLng[],
    cellSize: number
  ): Grid {
    this.sphericalApi = google.maps.geometry.spherical;
    const polygonBounds = new google.maps.LatLngBounds();
    const polygonCharacteristics = new PolygonCharacteristics(gridType);
    areaVertices.forEach(polygonCoord => {
      polygonBounds.extend(polygonCoord);
    });

    const areaCenter = this.getAreaCenter(polygonBounds);

    const farthestPoint = this.getFarthestPoint(areaVertices, areaCenter);

    const numOfLevels = this.getNumberOfLevels(
      farthestPoint.distance,
      cellSize,
      polygonCharacteristics
    );

    const centerPoints = this.getCenterPoints(
      numOfLevels,
      areaCenter,
      cellSize,
      farthestPoint.heading,
      polygonCharacteristics
    );

    const grid: Grid = new Grid();
    centerPoints.forEach(centerPoint => {
      const newPolygonCell = this.generateCell(
        centerPoint,
        cellSize,
        farthestPoint.heading + polygonCharacteristics.offset,
        polygonCharacteristics
      );
      if (
        this.polygonService.containsLocation(
          areaVertices,
          newPolygonCell.vertices
        )
      ) {
        grid.cells.push(newPolygonCell);
      }
    });
    return grid;
  }

  generateCell(
    centerPoint: LatLng,
    size: number,
    offset: number,
    polygonCharacteristics: PolygonCharacteristics
  ): PolygonCell {
    const polygonCell: PolygonCell = new PolygonCell(
      polygonCharacteristics.polygonType,
      centerPoint,
      this.polygonService.generatePolygon(
        polygonCharacteristics,
        centerPoint,
        size,
        offset + (polygonCharacteristics.polygonType === CellType.Rectangular ? polygonCharacteristics.offset : 0)
      )
    );
    return polygonCell;
  }

  private getNumberOfLevels(
    furthestPointDistance: number,
    cellSize: number,
    polygonCharacteristics: PolygonCharacteristics
  ): number {
    return Math.ceil(
      furthestPointDistance /
        (polygonCharacteristics.distanceFromCenterFunction(cellSize) / 2)
    );
  }

  private getFarthestPoint(
    areaVertices: LatLng[],
    areaCenter: LatLng
  ): { farthestPoint: LatLng; distance: number; heading: number } {
    let farthestPointDistance;
    const farthestPoint = areaVertices.reduce(
      (prev, current): LatLng => {
        const prevDistance = google.maps.geometry.spherical.computeDistanceBetween(
          areaCenter,
          prev
        );
        const currentDistance = google.maps.geometry.spherical.computeDistanceBetween(
          areaCenter,
          current
        );
        if (prevDistance > currentDistance) {
          farthestPointDistance = prevDistance;
          return prev;
        } else {
          farthestPointDistance = currentDistance;
          return current;
        }
      }
    );
    const heading = google.maps.geometry.spherical.computeHeading(
      areaCenter,
      farthestPoint
    );
    return {
      farthestPoint: farthestPoint,
      distance: farthestPointDistance,
      heading: heading
    };
  }

  private getAreaCenter(polygonBounds: LatLngBounds): LatLng {
    return polygonBounds.getCenter();
  }

  private getCenterPoints(
    numOfLevels: number,
    centerPoint: LatLng,
    size: number,
    offset: number,
    polygonCharacteristics: PolygonCharacteristics
  ): LatLng[] {
    let cellCenters: LatLng[] = [];
    cellCenters.push(centerPoint);

    if (numOfLevels <= 1) {
      return cellCenters;
    }

    let currentLevel = 1;

    while (currentLevel < numOfLevels) {
      cellCenters = cellCenters.concat(
        this.polygonService.generatePolygon(
          polygonCharacteristics,
          centerPoint,
          polygonCharacteristics.distanceFromCenterFunction(size) *
            currentLevel,
          offset,
          currentLevel,
          size,
          this.fillingFunction
        )
      );
      currentLevel++;
    }
    return cellCenters;
  }

  private fillingFunction(
    startingPoint: LatLng,
    currentLevel: number,
    fillingOffset: number,
    cellSize: number,
    sphericalApi: any,
    polygonCharacteristics: PolygonCharacteristics
  ): LatLng[] {
    const fillingCellCenters = [];
    let newPoint = startingPoint;
    for (
      let index = 1;
      index < polygonCharacteristics.fillingCellNumber(currentLevel);
      index++
    ) {
      newPoint = sphericalApi.computeOffset(
        newPoint,
        polygonCharacteristics.distanceBetweenCells(cellSize),
        fillingOffset
      );
      if (newPoint.lat() && newPoint.lng()) {
        fillingCellCenters.push(newPoint);
      }
    }
    return fillingCellCenters;
  }
}
