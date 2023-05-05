import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, Platform, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.page.html',
  styleUrls: ['./restaurants.page.scss'],
})
export class RestaurantsPage implements OnInit {

  vendors!: any[];
  products!: any[];
  categories!: any[];
  vendorsWithCategories!: any[];
  loading = false;
  page = 1;
  per_page = 4;
  orderby = "vendor_display_name";
  order = "desc";
  scaleFactor: number;

  constructor(private authService: AuthService,
    private storage: Storage, private toastController: ToastController, private platform: Platform) {
      this.scaleFactor = Math.min((platform.width() / 1000) * 2, (platform.height() / 1000) * 1.5);
    }

  ngOnInit() {
    this.vendors = [];
    this.categories = [];
    this.products = [];
    //this.loadProductsCategories(false);
    //this.loadProducts(false);
    this.loadVendorsItems(false);
    this.vendorsWithCategories = this.makeVendorsWithCategories();

  }

  loadVendorsItems(isRefresh: boolean, ev?: InfiniteScrollCustomEvent) {
    if (!ev && !isRefresh){
      this.loading = true;
    }
    this.authService.getStoreVendors(this.page, this.per_page, this.orderby, this.order).subscribe({
      next: (res: any) => {
        this.vendors.push(...res.body);
        const totalPages = 4;

        ev?.target.complete();
        if (ev){
          ev.target.disabled = totalPages === this.page;
        }
      },
      complete: () => {
        console.log(this.vendors);
        this.loading = false;
      }
    });
  }

  loadProducts(isRefresh: boolean, ev?: InfiniteScrollCustomEvent) {
    if (!ev && !isRefresh){
      this.loading = true;
    }
    for(let i = 1; i < 4; i++) {
      this.authService.getProducts(i).subscribe({
        next: (res: any) => {
          this.products.push(...res);
          //const totalPages = 1;

          //ev?.target.complete();
          //if (ev){
            //ev.target.disabled = totalPages === this.page;
          //}
        },
        complete: () => {
          console.log(this.products);
          this.loading = false;
        }
      });
    }
    
  }

  makeVendorsWithCategories() {
    let restaurantsWithCategories = this.vendors.map(vendor => {
        let categories = this.products.filter(product => product.store.vendor_id === vendor.vendor_id)
                                      .flatMap(product => product.categories.map((category: any) => category.name));
        return { 
            vendor,
            categories: [...new Set(categories)]
        };
    });
    return restaurantsWithCategories;
}

  onIonInfinite(ev: any) {
    this.page++;
    this.loadVendorsItems(false, ev);
    setTimeout(() => {}, 500);
  }

  firstLetterUpperCase(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  doRefresh(event: any) {
    this.vendors = [];
    this.page = 1;
    this.per_page = 4;
    const infiniteScroll = document.querySelector('ion-infinite-scroll');
    if (infiniteScroll) {
      infiniteScroll.disabled = false;
    }
    this.loadVendorsItems(true);
    event.target.complete();
  }
}

