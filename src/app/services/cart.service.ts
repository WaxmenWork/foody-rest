import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartChanged = new Subject<any[]>();
  private cart: { product: any; count: number, attributes: any[] }[] = [];
  private userId: string | null = null;
  private latestProduct: { product: any; count: number, attributes: any[] } = {product: null, count: 0, attributes: []};
  private alertButtons = [
    {
      text: 'Отмена',
      role: 'cancel',
      handler: () => { this.latestProduct = {product: null, count: 0, attributes: []} }
    },
    {
      text: 'Да',
      role: 'confirm',
      handler: () => { 
        this.turncateCart();
        if (this.latestProduct.product != null){
          this.addProduct(this.latestProduct.product, this.latestProduct.count, this.latestProduct.attributes);
        }
      }
    }
  ];

  constructor(private auth: AuthService, private alertController: AlertController) {  }

  setUserId(user: any) {
    this.userId = user.data.user['id'];
    this.loadCart();
  }

  getCart() {
    return this.cart;
  }

  addProduct(product: any, count: number = 1, attributes: any[] = []) {
    if (this.cart.length > 0 && this.cart[0].product.store.vendor_id !== product.store.vendor_id) {
      this.showAlert("Можно добавлять товары только из одного ресторана!\nОчистить корзину?");
      this.latestProduct = { product, count, attributes };
      return;
    }
    //if (attributes.length > 0){
      const cartItem = this.cart.find(item => item.product.id === product.id && this.deepEqual(item.attributes, attributes));
      if (cartItem) {
        cartItem.count += count;
      } else {
        this.cart.push({ product, count, attributes });
      }
      this.saveCart();
      this.latestProduct = {product: null, count: 0, attributes: []};
    //}
    // else {
    //   const cartItem = this.cart.find(item => item.product.id === product.id);
    //   if (cartItem) {
    //     cartItem.count += count;
    //   } else {
    //     this.cart.push({ product, count, attributes });
    //   }
    //   this.saveCart();
    //   this.latestProduct = {product: null, count: 0, attributes: []};
    // }
  }

  setProduct(product: any, count: number, attributes: any[] = []) {
    if (count < 0) {
      return;
    }
    const cartItemIndex = this.cart.findIndex(item => item.product.id === product.id && this.deepEqual(item.attributes, attributes));
    if (cartItemIndex > -1) {
      if (count === 0) {
        this.cart.splice(cartItemIndex, 1);
      } else {
        this.cart[cartItemIndex].count = count;
      }
    }

    this.saveCart();
  }
  
  removeProduct(product: any, attributes: any[] = []) {
    if (attributes.length > 0){
      const cartItemIndex = this.cart.findIndex(item => item.product.id === product.id && this.deepEqual(item.attributes, attributes));
  
      if (cartItemIndex > -1) {
        const cartItem = this.cart[cartItemIndex];
        if (cartItem.count > 1) {
          cartItem.count--;
        } else {
          this.cart.splice(cartItemIndex, 1);
        }
    
        this.saveCart();
      }
    }
    else {
      const cartItemIndex = this.cart.findIndex(item => item.product.id === product.id);
  
      if (cartItemIndex > -1) {
        const cartItem = this.cart[cartItemIndex];
        if (cartItem.count > 1) {
          cartItem.count--;
        } else {
          this.cart.splice(cartItemIndex, 1);
        }
    
        this.saveCart();
      }
    }
  }

  turncateCart() {
    this.cart = [];
    this.saveCart();
  }

  saveCart() {
    //console.log(this.cart);
    if (this.userId) {
      localStorage.setItem(`cart-${this.userId}`, JSON.stringify(this.cart));
      this.cartChanged.next(this.cart);
    }
  }

  loadCart() {
    if (this.userId) {
      const cart = localStorage.getItem(`cart-${this.userId}`);
      if (cart) {
        this.cart = JSON.parse(cart);
      }
    }
  }

  showAlert(msg: any) {
    let alert = this.alertController.create({
      message: msg,
      buttons: this.alertButtons
    });
    alert.then(alert => alert.present())
  }

  productInCart(product: any, attributes: any[] = []) {
    if (attributes.length > 0){
      //console.log(product, attributes);
      return this.cart.find(item => item.product.id === product.id && this.deepEqual(item.attributes, attributes));
    }
    else {
      return this.cart.find(item => item.product.id === product.id);
    }
  }

  productCounter(product: any){
    return this.cart.filter(item => item.product.id === product.id).reduce((acc, item) => acc + item.count, 0);
  }

  deepEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) && Array.isArray(b[i])) {
            if (!this.deepEqual(a[i], b[i])) return false;
        } else if (typeof a[i] === 'object' && typeof b[i] === 'object') {
            if (!this.deepEqual(Object.entries(a[i]), Object.entries(b[i]))) return false;
        } else if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
}
