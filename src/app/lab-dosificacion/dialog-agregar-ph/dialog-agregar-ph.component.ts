import { Component, Optional, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialogRef, MatDialog} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../authentication/auth.service';

interface data {
  Title: string,
  Corr_Carta: number,
  Sec: number,
  Correlativo: number,
  JabonadoIndex: number,
  Condicion: number,
  Tip_Ten: string
}

@Component({
  selector: 'app-dialog-agregar-ph',
  templateUrl: './dialog-agregar-ph.component.html',
  styleUrl: './dialog-agregar-ph.component.scss'
})
export class DialogAgregarPhComponent implements OnInit {

  constructor(
    private labColTrabajoService: LabColTrabajoService,
    private SpinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<DialogAgregarPhComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) { 
      console.log('Usuario activo: -------', this.authService.getUsuario()); 
    } else { 
      this.router.navigate(['/login']); 
    }
  }

  ValorPH: string = '';
  
  onAgregarPh(): void {
  const valorPh = this.ValorPH.trim();
  
  if (valorPh === '') return;

  const esNumeroValido = /^-?\d+(\.\d+)?$/.test(valorPh);
  if (!esNumeroValido) {
    this.toastr.warning('Ingrese solo valores numéricos para el pH');
    return;
  }

  if (parseFloat(valorPh) < 0 || parseFloat(valorPh) > 14) {
    this.toastr.warning('El valor de pH debe estar entre 0 y 14');
    return;
  }


  const payload = {
    corr_Carta: this.data.Corr_Carta,
    sec: this.data.Sec,
    correlativo: this.data.Correlativo,
    tip_Ph: this.data.Condicion,
    jabonadoIndex: this.data.JabonadoIndex,
    ph_Val: parseFloat(valorPh),
    tip_Ten: this.data.Tip_Ten
  };

  //console.log('-----------------------', payload);
  this.SpinnerService.show();

  this.labColTrabajoService.patchActualizarPH(payload)
    .pipe(finalize(() => {
      this.SpinnerService.hide();
      this.dialogRef.close();
    }))
    .subscribe({
      next: (response: any) => {
        console.log('Respuesta completa:', response);
        this.toastr.success(response.message || 'Actualización exitosa', '', {
          timeOut: 2500,
        });
      },
      error: (err) => {
        console.error('Error al actualizar PH:', err);
        this.toastr.error('Error al actualizar PH');
      }
    });
}



  cerrar(): void {
    console.log('Formulario cerrado');
  }

}
