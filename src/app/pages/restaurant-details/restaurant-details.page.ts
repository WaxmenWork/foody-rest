import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { ProductDetailsComponent } from 'src/app/components/product-details/product-details.component';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant-details.page.html',
  styleUrls: ['./restaurant-details.page.scss'],
})
export class RestaurantDetailsPage implements OnInit {

  @ViewChild('modalContent') modalContent: any;

  vendor!: any;
  products!: any[];
  products_image = "foodota-widget-product";
  loading = false;
  page = 1;
  per_page = 4;
  orderby = "product_display_name";
  order = "desc";
  cartItemsCount = 1;
  productInCart_count = 0;
  routeChanged = new Subject<any[]>();
  private cart: { product: any; count: number }[] = [];

  constructor(
    public modalController: ModalController,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cartService: CartService
    ) {
    this.vendor = {};
    this.products = [];
  }

  async ngOnInit() {
    this.loadVendorDetails();
    this.cartService.setUserId(this.authService.user);
    this.authService.userChanged.subscribe(user => this.cartService.setUserId(user));
    this.cart = this.cartService.getCart();
    this.cartItemsCount = this.cart.length;
    this.cartService.cartChanged.subscribe(cart => {
      this.cart = this.cartService.getCart();
      this.cartItemsCount = this.cart.length;
    });
  }
  

  loadVendorDetails(){
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    this.authService.getStoreVendor(id).subscribe({
      next: (res) => {
        this.vendor = res;
        this.loadProducts();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadProducts(ev?: InfiniteScrollCustomEvent) {
    const id = this.route.snapshot.paramMap.get('id');
    this.authService.getProductsByVendor(id, this.orderby, this.order).subscribe({
      next: (res: any) => {
        this.products.push(...res.body);
        console.log(res.body);
        const totalPages = 1;

        ev?.target.complete();
        if (ev){
          ev.target.disabled = totalPages === this.page;
        }
      },
    });
  }

  onIonInfinite(ev: any) {
    this.page++;
    this.loadProducts(ev);
    setTimeout(() => {}, 500);
  }

  firstLetterUpperCase(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async presentModal(product: any) {
    const modal = await this.modalController.create({
      component: ProductDetailsComponent,
      cssClass: 'my-custom-modal',
      presentingElement: await this.modalController.getTop(),
      canDismiss: true,
      breakpoints: [0.0, 1.0],
      backdropBreakpoint: 0.5,
      initialBreakpoint: 1.0,
      componentProps: {
        product,
        fromCart: false
      },
      handle: true
    });
    return await modal.present();
  }

  productInCart(product: any) {
    return this.cartService.productInCart(product);
  }

  productCount(product: any) {
    return this.cartService.productCounter(product);
  }

  checkAttributes(attributes: any[]) {
    if (attributes.length > 0) {
        let attr = attributes.filter((attribute: any) => attribute.visible).map((attribute: any) => ({
            attribute,
            option: attribute.options[0]
        }));
        return attr.length > 0;
    }
    return false;
}

  addToCart(product: any) {
    this.cartService.addProduct(product);
    this.cart = this.cartService.getCart();
  }

  removeFromCart(product: any) {
    this.cartService.removeProduct(product);
    this.cart = this.cartService.getCart();
  }

}
