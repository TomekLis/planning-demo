import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { SensitiveData } from '../apiKeys';
import { MapComponent } from './map/map.component';
import { GridGeneratorService } from './services/grid-generator.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MapsService } from './services/maps.service';
import { PolygonService } from './services/polygon.service';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: SensitiveData.API_KEY, // hides Google map API key
      libraries: ['places', 'drawing']
    })
  ],
  providers: [GridGeneratorService, MapsService, PolygonService],
  declarations: [AppComponent, MapComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
