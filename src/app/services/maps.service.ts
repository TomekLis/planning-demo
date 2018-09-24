import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AgmPolygon } from '@agm/core';
interface Point {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  areas: Area[] = [];
  private areasUpdated = new Subject<Area[]>();

  getAreasListener() {
    return this.areasUpdated.asObservable();
  }

  addNewArea(area: Area) {
    this.areas.push(area);
    this.areasUpdated.next(this.areas);
  }

  getDefaultPolygon(lat: number, lng: number) {
    const polygonCoords = [];
    const latDelta = 0.06;
    const lngDelta = 0.1;

    polygonCoords.push(
      {
        lat: lat - latDelta,
        lng: lng - lngDelta
      },
      {
        lat: lat + latDelta,
        lng: lng - lngDelta
      },
      {
        lat: lat + latDelta,
        lng: lng + lngDelta
      },
      {
        lat: lat - latDelta,
        lng: lng + lngDelta
      }
    );

    return polygonCoords;
  }
}
export class Area {
  constructor(
    public name: string,
    public square: number,
    public points: { lat: number; lng: number }[] = []
  ) {}

  get pointsForView() {
    let result = '';
    this.points.forEach(point => {
      result += `${point.lat}, ${point.lng}\n`;
    });
    return result;
  }
}
