import { Injectable } from '@angular/core';
import {AuthService} from './auth.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class HttpInterceptorService implements HttpInterceptor{
  constructor(private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ( error.status === 401) {
          this.authService.logOut();
        }
        return throwError(error);
      })
    );
  }

  addAuthHeader(request: HttpRequest<any>) {
    const token = this.authService.getAccessToken();

    if (token) {
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      });
    }
    return request;
  }
}
