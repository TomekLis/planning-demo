import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  OnChanges,
  SimpleChanges
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
import { FormsModule, FormGroup } from '@angular/forms';

import { MapsService, Area } from '../../services/maps.service';
import { GridGeneratorService } from '../../services/grid-generator.service';
import { CellType, PolygonCell } from '../../model/polygon';
import { PolygonService } from '../../services/polygon.service';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Grid } from '../../model/grid';
import { LoadingModalComponent } from '../loading-modal/loading-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { CustomErrorStateMatcher } from '../../helpers/ErrorStateMatcher';

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
  private agmPolygon: AgmPolygon;
  private location: string;
  private autocomplete: any;
  isLoading = false;
  zoom = 12;
  markerCoords: LatLng[] = [];
  grid$: Promise<Grid>;
  polygonCoords: Point[] = [];

  cellSizeControl = new FormControl('', [
    Validators.required,
    Validators.min(500),
    Validators.max(1500)
  ]);

  cellTypeControl = new FormControl('', [Validators.required]);

  matcher = new CustomErrorStateMatcher();

  cellTypeRadioOptions = [
    { name: 'Hexagonal', value: CellType.Hexagonal },
    { name: 'Rectangular', value: CellType.Rectangular }
  ];

  constructor(
    private ngZone: NgZone,
    private mapsAPILoader: MapsAPILoader,
    private mapsService: MapsService,
    private gridGeneratorService: GridGeneratorService,
    private polygonService: PolygonService,
    private modalService: NgbModal
  ) {}

  async ngOnInit() {
    await this.mapsAPILoader.load();
    this.initAutocomplete();
  }

  async onConfirmSelection() {
    const bounds = new google.maps.LatLngBounds();
    const polygonCoords = await this.polygonService.getPolygonPoints(
      this.agmPolygon
    );

    polygonCoords.forEach(polygonCoord => {
      bounds.extend(polygonCoord);
    });

    this.grid$ = this.gridGeneratorService.GenerateGrid(
      this.cellTypeControl.value,
      polygonCoords,
      this.cellSizeControl.value
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
