import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import {
  LatLngLiteral,
  AgmPolygon,
  MapsAPILoader,
  PolygonManager,
  AgmInfoWindow,
  LatLng
} from '@agm/core';
import { Point } from '@agm/core/services/google-maps-types';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MapsService, Area } from '../services/maps.service';
import { GridGeneratorService } from '../services/grid-generator.service';
import { CellType, PolygonCell } from '../model/polygon';
import { Grid } from '../model/grid';
import { PolygonService } from '../services/polygon.service';
declare const google: any;

@Component({
  selector: 'google-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  latitude = 51.476852;
  longitude = -0.0005;
  infoWindowLat: number;
  infoWindowLng: number;
  areaSize = 0;
  isPlaceSelected = false;
  @ViewChild('search')
  private searchElementRef: ElementRef;
  @ViewChild(AgmInfoWindow)
  private agmInfoWindow;
  @ViewChild(AgmPolygon)
  private agmPolygon;
  private location: string;
  private autocomplete: any;

  markerCoords: LatLng[] = [];
  grid: Grid = { cells: [] };
  polygonCoords: Point[] = [];

  constructor(
    private ngZone: NgZone,
    private mapsAPILoader: MapsAPILoader,
    private mapsService: MapsService,
    private gridGeneratorService: GridGeneratorService,
    private polygonService: PolygonService
  ) {}

  async ngOnInit() {
    await this.mapsAPILoader.load();
    this.initAutocomplete();
  }

  async onConfirmSelection() {
    const bounds = new google.maps.LatLngBounds();
    const polygonCoords = await this.polygonService.getPolygonPoints(this.agmPolygon);
    console.log(polygonCoords);
    polygonCoords.forEach(polygonCoord => {
      bounds.extend(polygonCoord);
    });
    this.grid = await this.gridGeneratorService.GenerateGrid(
      CellType.Hexagonal,
      polygonCoords,
      1000
    );
  }

  async calculateAreaSize() {
    const points = await this.polygonService.getPolygonPoints(this.agmPolygon);
    const bounds = new google.maps.LatLngBounds();
    points.forEach(coord => bounds.extend(coord));
    const centerPoint = bounds.getCenter();
    this.infoWindowLat = centerPoint.lat();
    this.infoWindowLng = centerPoint.lng();
    this.areaSize = Math.round(
      google.maps.geometry.spherical.computeArea(points)
    );
  }

  private initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      {}
    );
    this.autocomplete.addListener('place_changed', () => this.onPlaceChanged());
  }

  private onPlaceChanged() {
    this.ngZone.run(() => {
      const place = this.autocomplete.getPlace();

      if (place.geometry === undefined || place.geometry === null) {
        return;
      }

      this.isPlaceSelected = true;
      this.latitude = place.geometry.location.lat();
      this.longitude = place.geometry.location.lng();
      this.location = place.name;
      this.buildDefaultPolygon();
      this.agmInfoWindow.open();
      setTimeout(() => this.calculateAreaSize(), 100);
    });
  }

  private buildDefaultPolygon() {
    this.polygonCoords = this.mapsService.getDefaultPolygon(
      this.latitude,
      this.longitude
    );
  }
}
