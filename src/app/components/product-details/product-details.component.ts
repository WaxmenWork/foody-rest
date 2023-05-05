import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent  implements OnInit {

  @Input() product: any;
  @Input() attributes: {attribute: any, option: any[]}[] = [];
  @Input() fromCart: boolean = false;

  product_count = 1;
  products_image = "foodota-primary-banner";
  isExistInCart = false;

  constructor(private modalController: ModalController, private cart: CartService) { }

  ngOnInit() {
    if (this.attributes.length == 0) {
      this.attributes = this.product.attributes.filter((attribute: any) => attribute.visible).map((attribute: any) => ({
          attribute,
          option: attribute.options[0]
      }));
    }
    
    const addedProduct = this.productInCart();
    if (addedProduct) {
      this.product_count = addedProduct.count;
      this.isExistInCart = true;
    }
    if (this.isExistInCart && !this.fromCart && this.attributes.length > 0) {
      this.product_count = 1;
    }
    //const modal = document.querySelector('.my-custom-modal') as HTMLElement;
    //modal.style.setProperty('--product-img', `url('${this.product.images[0][this.products_image]}')`);
  }
  
  productIncrement() {
    this.product_count++;
  }

  productDecrement() {
    this.product_count--;
  }

  productAddToCart() {
    this.cart.addProduct(this.product, this.product_count, this.attributes);
    this.modalController.dismiss();
  }

  productSetCount() {
    if (this.isExistInCart) {
      this.cart.setProduct(this.product, this.product_count, this.attributes);
      this.modalController.dismiss();
      return;
    }
    this.modalController.dismiss();
  }

  setAttributes(attribute: any, option: any){
    const attributeIndex = this.attributes.findIndex(item => item.attribute === attribute);
    if (attributeIndex > -1) {
      this.attributes[attributeIndex].option = option;
    }
    else {
      this.attributes.push({attribute, option});
    }
  }

  productInCart() {
    return this.cart.productInCart(this.product, this.attributes);
  }

  firstLetterUpperCase(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }


}
