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
  constructor(private polygonService: PolygonService) {}

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

    const farthestPoint = this.getFarthestPoint(areaVertices, areaCenter);

    const numOfLevels = this.getNumberOfLevels(
      farthestPoint.distance,
      cellSize
    );

    const centerPoints = this.getCenterPoints(
      numOfLevels,
      areaCenter,
      cellSize,
      farthestPoint.heading
    );

    const grid: Grid = new Grid();
    centerPoints.forEach(centerPoint => {
      const newPolygonCell = this.generateCell(
        centerPoint,
        cellSize,
        farthestPoint.heading
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

  generateCell(centerPoint: LatLng, size: number, offset: number): PolygonCell {
    const polygonCell: PolygonCell = new PolygonCell(
      CellType.Hexagonal,
      centerPoint
    );
    for (let heading = 0 + offset; heading < 360 + offset; heading += 60) {
      polygonCell.vertices.push(
        this.sphericalApi.computeOffset(centerPoint, size, heading)
      );
    }
    return polygonCell;
  }

  private getNumberOfLevels(
    furthestPointDistance: number,
    cellSize: number
  ): number {
    return Math.ceil(furthestPointDistance / ((cellSize * Math.sqrt(3)) / 2));
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
    offset: number
  ): LatLng[] {
    let cellCenters: LatLng[] = [];
    cellCenters.push(centerPoint);

    if (numOfLevels <= 1) {
      return cellCenters;
    }

    const distanceFromCenter = size * Math.sqrt(3);
    let currentLevel = 0;

    while (currentLevel < numOfLevels - 1) {
      cellCenters = cellCenters.concat(
        this.polygonService.generatePolygon(
          centerPoint,
          distanceFromCenter * (currentLevel + 1),
          offset + 30,
          60,
          currentLevel,
          120,
          distanceFromCenter,
          this.fillingFunction
        )
      );
      currentLevel++;
    }
    return cellCenters;
  }

  private fillingFunction(
    startingPoint: LatLng,
    level: number,
    fillingOffset: number,
    distanceFromStartingPoint: number,
    sphericalApi: any
  ): LatLng[] {
    const fillingCellCenters = [];
    for (let index = 1; index <= level; index++) {
      const newPoint = sphericalApi.computeOffset(
        startingPoint,
        distanceFromStartingPoint * index,
        fillingOffset
      );
      fillingCellCenters.push(newPoint);
    }
    return fillingCellCenters;
  }
}
