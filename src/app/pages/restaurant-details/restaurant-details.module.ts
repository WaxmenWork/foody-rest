import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RestaurantDetailsPageRoutingModule } from './restaurant-details-routing.module';

import { RestaurantDetailsPage } from './restaurant-details.page';
import { ProductDetailsComponent } from 'src/app/components/product-details/product-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RestaurantDetailsPageRoutingModule
  ],
  declarations: [RestaurantDetailsPage, ProductDetailsComponent]
})
export class RestaurantDetailsPageModule {}
