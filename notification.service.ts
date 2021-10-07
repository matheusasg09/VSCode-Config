import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private confirmConfig: SweetAlertOptions = {
    icon: 'question',
    confirmButtonText: 'Confirmar',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#7030a0',
    heightAuto: false,
    showCloseButton: true,
    customClass: {
      cancelButton: 'Swal__cancelButton',
    },
  };

  constructor(private toastr: ToastrService) {
    this.toastr.toastrConfig.preventDuplicates = true;
    this.toastr.toastrConfig.resetTimeoutOnDuplicate = true;
    this.toastr.toastrConfig.timeOut = 10000;
    this.toastr.toastrConfig.progressBar = true;
  }

  confirm(options: SweetAlertOptions): Observable<boolean> {
    return from(
      Swal.fire({
        ...this.confirmConfig,
        ...options,
      })
    ).pipe(pluck('isConfirmed'));
  }

  success(text: string, title = 'Sucesso!'): void {
    this.toastr.success(text, title);
  }

  error(error: string | HttpErrorResponse, title = 'Erro!'): void {
    if (typeof error === 'string') {
      this.toastr.error(error, title);
      return;
    }

    this.readErrorResponse(error);
  }

  warning(text: string, title = 'Atenção!'): void {
    this.toastr.warning(text, title);
  }

  info(text: string, title = 'Informação'): void {
    this.toastr.info(text, title);
  }

  private readErrorResponse(error: HttpErrorResponse): void {
    const errors = this.parseErrorObject(error);

    if (!errors?.length) {
      this.error('Ocorreu um erro interno. Recarregue a página e tente novamente.');
      return;
    }

    errors.forEach(this.error.bind(this));
  }

  private extractErrorObject(error: any): { [key: string]: any } {
    return error.error?.obj || error.obj;
  }

  private extractErrorMessage(error: any): string | null {
    return error.error?.message ?? error.message;
  }

  private isErrorString(error: any): boolean {
    return error.message && typeof error.message === 'string';
  }

  private parseErrorObject(error: any): string[] {
    const errors = [];

    if (this.isErrorString(this.extractErrorMessage(error))) {
      errors.push(error.message);
    }

    if (error.error?.message) {
      errors.push(error.error.message);
    }

    const errorObject = this.extractErrorObject(error);

    if (errorObject) {
      errors.push(...Object.values(errorObject));
    }

    return errors;
  }
}
