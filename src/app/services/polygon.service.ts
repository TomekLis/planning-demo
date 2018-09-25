import { Injectable } from '@angular/core';
import { AgmPolygon } from '@agm/core';
import { Point, LatLng } from '@agm/core/services/google-maps-types';
import { Coordinate } from 'jsts/org/locationtech/jts/geom/Coordinate';
declare const google: any;
import * as jsts from 'jsts';

@Injectable({
  providedIn: 'root'
})
export class PolygonService {
  geometryFactory = new jsts.geom.GeometryFactory();

  constructor() {}

  async getPolygonPoints(agmPolygon: AgmPolygon) {
    const polygon = await (agmPolygon as any)._polygonManager._polygons.get(
      agmPolygon
    );
    const points: LatLng[] = [];
    polygon.getPath().forEach(coordinate => {
      points.push(new google.maps.LatLng(coordinate.lat(), coordinate.lng()));
    });
    return points;
  }

  containsLocation(mainAreaVertices: LatLng[], cellVertices: LatLng[]) {
    const mainAreaPolygon = this.createJstsPolygon(mainAreaVertices);
    const cellPolygon = this.createJstsPolygon(cellVertices);
    return mainAreaPolygon.intersects(cellPolygon);
  }
  private createJstsPolygon(polygonVertices: LatLng[]) {
    const coords = polygonVertices.map(polygonVertex => {
      return new jsts.geom.Coordinate(polygonVertex.lat(), polygonVertex.lng());
    });

    coords.push(
      new jsts.geom.Coordinate(
        polygonVertices[0].lat(),
        polygonVertices[0].lng()
      )
    );
    const shell = this.geometryFactory.createLinearRing(coords);
    return this.geometryFactory.createPolygon(shell);
  }

  generatePolygon(
    centerPoint: LatLng,
    size: number,
    offset: number,
    step: number,
    fillingLevel?: number,
    fillingOffset?: number,
    distanceFromStartingPoint?: number,
    fillingFunction?: (
      startingPoint: LatLng,
      currentLevel: number,
      fillingOffset: number,
      distanceFromStartingPoint: number,
      sphericalApi: any
    ) => LatLng[]
  ): LatLng[] {
    const sphericalApi = google.maps.geometry.spherical;
    let polygonVertices: LatLng[] = [];

    for (let heading = offset; heading < 360 + offset; heading += step) {
      const newPoint = sphericalApi.computeOffset(centerPoint, size, heading);
      polygonVertices.push(newPoint);

      if (fillingFunction) {
        const fillingPoints = fillingFunction(
          newPoint,
          fillingLevel,
          heading + fillingOffset,
          distanceFromStartingPoint,
          sphericalApi
        );
        polygonVertices = polygonVertices.concat(fillingPoints);
      }
    }
    return polygonVertices;
  }
}
