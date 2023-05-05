import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  profileButtons = [
    {
      title: "Настройки"
    },
    {
      title: "Мои заказы"
    },
    {
      title: "О нас"
    }
  ]
  private alertButtons = [
    {
      text: 'Отмена',
      role: 'cancel',
      handler: () => {  }
    },
    {
      text: 'Да',
      role: 'confirm',
      handler: () => { 
        this.auth.logout();
      }
    }
  ];
  user!: any;
  loading = false;

  constructor(private auth: AuthService, private alertController: AlertController) { }

  ngOnInit() {
    this.getUserProfile();
  }

  logout() {
    this.showAlert("Вы уверены, что хотите выйти из аккаунта?");
  }

  getUserProfile() {
    this.loading = true;
    this.auth.getUserProfile().subscribe({
      next: (res: any) => {
        this.user = res;
        console.log(res);
      },
      complete: () => {
        this.loading = false;
      }
    })
  }

  showAlert(msg: any) {
    let alert = this.alertController.create({
      message: msg,
      buttons: this.alertButtons
    });
    alert.then(alert => alert.present())
  }

}
