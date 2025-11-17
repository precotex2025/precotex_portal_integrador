import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';

interface data{
  corr_Carta: number;
  sec: number;
  correlativo: number;
}



@Component({
  selector: 'app-dialog-detalle-color',
  templateUrl: './dialog-detalle-color.component.html',
  styleUrl: './dialog-detalle-color.component.scss'
})
export class DialogDetalleColorComponent implements OnInit{


constructor(
  private LabColTraService: LabColTrabajoService,
  private toastr: ToastrService,
  private SpinnerService: NgxSpinnerService,
  @Inject(MAT_DIALOG_DATA) public data: data,
  public dialogRef: MatDialogRef<DialogDetalleColorComponent>
){}

ngOnInit(): void {
  
  this.cargarReceta(this.data.corr_Carta, this.data.sec, this.data.correlativo);
}

recetaDetalle: any = null;

cargarReceta(corrCarta: number, sec: number, correlativo: number): void {
  this.SpinnerService.show();
  this.LabColTraService.getCargarColoranteParaDetalle(corrCarta, sec, correlativo).subscribe({
    next: (response: any) => {
      if (response.success && response.totalElements > 0) {
        this.recetaDetalle = response.elements[0];
        console.log('Receta cargada:', this.recetaDetalle);
      }
      this.SpinnerService.hide();
    },
    error: () => {
      this.SpinnerService.hide();
      this.toastr.error('Error al cargar detalle de receta');
    }
  });
}


}
