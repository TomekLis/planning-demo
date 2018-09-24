import { Injectable } from '@angular/core';
import { AgmPolygon } from '@agm/core';
import { Point, LatLng } from '@agm/core/services/google-maps-types';
declare const google: any;
@Injectable({
  providedIn: 'root'
})
export class PolygonService {
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

  generatePolygon(centerPoint: LatLng, size: number, offset: number) {}
}
