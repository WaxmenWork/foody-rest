import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent  implements OnInit {

  public cartItemsCount = 0;

  constructor(public cartService: CartService, private auth: AuthService) { }

  ngOnInit() {
    this.cartService.setUserId(this.auth.user);
    this.auth.userChanged.subscribe(user => this.cartService.setUserId(user));
    this.cartItemsCount = this.cartService.getCart().length;
    this.cartService.cartChanged.subscribe(cart => {
      this.cartItemsCount = this.cartService.getCart().length;
    });
  }

}
