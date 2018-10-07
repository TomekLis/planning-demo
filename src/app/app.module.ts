import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { SensitiveData } from '../apiKeys';
import { MapComponent } from './components/map/map.component';
import { GridGeneratorService } from './services/grid-generator.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MapsService } from './services/maps.service';
import { PolygonService } from './services/polygon.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingModalComponent } from './components/loading-modal/loading-modal.component';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatGridListModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatRadioModule
} from '@angular/material';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatGridListModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatRadioModule,
    AgmCoreModule.forRoot({
      apiKey: SensitiveData.API_KEY, // hides Google map API key
      libraries: ['places', 'drawing']
    })
  ],
  providers: [GridGeneratorService, MapsService, PolygonService],
  declarations: [AppComponent, MapComponent, LoadingModalComponent],
  bootstrap: [AppComponent],
  entryComponents: [LoadingModalComponent]
})
export class AppModule {}
