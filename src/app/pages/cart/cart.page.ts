import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { ProductDetailsComponent } from 'src/app/components/product-details/product-details.component';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  cart: any[] = [];
  product_image = "foodota-recipe-images-cion";
  showBackButton = false;

  constructor(private cartService: CartService, private auth: AuthService, private modalController: ModalController, private router: Router, private navCtrl: NavController) {
    
  }

  ngOnInit() {
    this.cartService.setUserId(this.auth.user);
    this.auth.userChanged.subscribe(user => this.cartService.setUserId(user));
    this.cart = this.cartService.getCart();
    this.cartService.cartChanged.subscribe(cart => {
      this.cart = cart;
      console.log(this.cart);
    });
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.previousNavigation) {
      const previousUrl = navigation.previousNavigation.finalUrl;
      this.showBackButton = !!(previousUrl && previousUrl.toString().includes('restaurants/'));
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  addToCart(product: any, attributes: any[]) {
    this.cartService.addProduct(product, 1, attributes);
    this.cart = this.cartService.getCart();
  }

  removeFromCart(product: any, attributes: any[]) {
    this.cartService.removeProduct(product, attributes);
    this.cart = this.cartService.getCart();
  }

  turncateCart(){
    this.cartService.showAlert("Очистить корзину?");
    this.cart = this.cartService.getCart();
  }

  logout() {
    this.auth.logout();
  }
  async presentModal(product: any, attributes: any[]) {
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
        attributes,
        fromCart: true
      },
      handle: true
    });
    return await modal.present();
  }

  attributesOptionsToString(attributes: any[]) {
    return attributes.map(attribute => attribute.option).join(', ');
  }

}
