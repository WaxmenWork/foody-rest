import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages!: any[];
  public state: boolean;

  constructor(
    private platform: Platform,
    private auth: AuthService,
    private menu: MenuController,
    private navCtrl: NavController
  ) {
    this.appPages = [
      {
        type: "button",
        title: "Профиль",
        icon: "person",
        url: "profile",
        logged: true
      },
      {
        type: "button",
        title: "Заказы",
        icon: "list",
        url: "orders",
        logged: true
      },
      {
        type: "link",
        title: "Стать курьером",
        icon: "walk",
        url: "https://foody.rest/driver/#",
        logged: false
      }
    ]
    this.state = false;
    this.initializeApp();
  }

  async ngOnInit() {
    await this.auth.init();
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      this.auth.authentificationState.subscribe(state => {
        this.state = state;
        if (!state) {
          this.navCtrl.navigateRoot(['login']);
        } else {
          this.navCtrl.navigateRoot(['restaurants']);
        }
      })
    })
  }

  logout() {
    this.menu.close()
    this.auth.logout();
  }
}
