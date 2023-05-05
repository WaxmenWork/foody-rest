import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

const TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = environment.url;
  user = null;
  userChanged = new Subject<any>();
  authentificationState = new BehaviorSubject(false);
  headers!: any;

  constructor(private http: HttpClient, private helper: JwtHelperService, private storage: Storage,
    private plt: Platform, private alertController : AlertController) {
      this.plt.ready().then(() => {
        this.checkToken();
      });
    }

    async init() {
      await this.storage.create();
    }

    checkToken(){
      this.storage.get(TOKEN_KEY).then(token => {
        if (token) {
          let decoded = this.helper.decodeToken(token);
          let isExpired = this.helper.isTokenExpired(token);

          if (!isExpired) {
            this.user = decoded;
            this.headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            });
            this.authentificationState.next(true);
          } else {
            this.storage.remove(TOKEN_KEY);
          }
        }
      });
    }

    register(credentials: any) {
      return this.http.post(`${this.url}/jwt-auth/v1/registration`, credentials).pipe(
        catchError(e => {
          this.showAlert(e.error.message);
          throw new Error(e.error.message);
        })
      )
    }

    login(credentials: any) {
      return this.http.post(`${this.url}/jwt-auth/v1/token`, credentials)
      .pipe(
        tap((res : any) => {
          this.storage.set(TOKEN_KEY, res['token']);
          this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${res['token']}`
          });
          this.user = this.helper.decodeToken(res['token']);
          this.userChanged.next(this.user);
          this.authentificationState.next(true);
        }),
        catchError(e => {
          this.showAlert(e.error.message);
          throw new Error(e.error.message);
        })
      )
    }

    logout() {
      this.storage.remove(TOKEN_KEY).then(() => {
        this.authentificationState.next(false);
      })
      this.headers = null;
    }

    getUserProfile() {
      return this.http.get(`${this.url}/wcfmmp/v1/user-profile`, {headers: this.headers}).pipe(
        catchError(e => {
          let status = e.status;
          if (status === 401 || status === 403) {
            this.showAlert('Ошибка доступа');
            this.logout();
          }
          throw new Error(e.error.message);
        })
      )
    }

    getStoreVendors(page = 1, per_page = 2, orderby = "vendor_display_name", order="desc") {
      return this.http.get(`${this.url}/wcfmmp/v1/store-vendors?page=${page}&per_page=${per_page}&orderby=${orderby}&order=${order}`, {observe: 'response'}).pipe(
        catchError(e => {
          let status = e.status;
          if (status === 401 || status === 403) {
            this.showAlert('Ошибка доступа');
            this.logout();
          }
          throw new Error(e.error.message);
        })
      )
    }

    getStoreVendor(id: any){
      return this.http.get(`${this.url}/wcfmmp/v1/store-vendors/${id}`).pipe(
        catchError(e => {
          let status = e.status;
          if (status === 401 || status === 403) {
            this.showAlert('Ошибка доступа');
            this.logout();
          }
          throw new Error(e.error.message);
        })
      )
    }

    getProductsByVendor(id: any, orderby = "vendor_display_name", order="desc"){
      return this.http.get(`${this.url}/wcfmmp/v1/store-vendors/${id}/products?orderby=${orderby}&order=${order}`, {observe: 'response'}).pipe(
        catchError(e => {
          let status = e.status;
          if (status === 401 || status === 403) {
            this.showAlert('Ошибка доступа');
            this.logout();
          }
          throw new Error(e.error.message);
        })
      )
    }

    getProducts(page = 1, per_page = 100) {
      return this.http.get(`${this.url}/wcfmmp/v1/products?page=${page}&per_page=${per_page}`).pipe(
        catchError(e => {
          let status = e.status;
          if (status === 401 || status === 403) {
            this.showAlert('Ошибка доступа');
            this.logout();
          }
          throw new Error(e.error.message);
        })
      )
    }

    getProductsCategories() {
      console.log(this.headers);
      return this.http.get(`${this.url}/wcfmmp/v1/products/categories`, {observe: 'response', headers: this.headers}).pipe(
        catchError(e => {
          let status = e.status;
          if (status === 401 || status === 403) {
            this.showAlert('Ошибка доступа');
            this.logout();
          }
          throw new Error(e.error.message);
        })
      )
    }

    isAuthenticated() {
      return this.authentificationState.value;
    }

    showAlert(msg: any) {
      let alert = this.alertController.create({
        message: msg,
        header: 'Error',
        buttons: ['OK']
      });
      alert.then(alert => alert.present())
    }
}