import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(catchError((error: HttpErrorResponse, a: any) => {
    console.log("Error al realizar la peticion: ", error);
    let errorMessage = "";

    if(error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if(error.error.error) {
        errorMessage = `Error: ${error.error.error}`;
      } else {
        errorMessage = `Error code: ${error.status}, Error: ${error.message}`;
      }
    }

    return throwError(() => errorMessage);
  }))
};