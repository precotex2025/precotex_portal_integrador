import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';

interface data {
  corr_Carta: any;
  sec: number;
  correlativo: number;
}

@Component({
  selector: 'app-dialog-detalle-color',
  templateUrl: './dialog-detalle-color.component.html',
  styleUrl: './dialog-detalle-color.component.scss'
})
export class DialogDetalleColorComponent implements OnInit, AfterViewInit {


  constructor(
    private LabColTraService: LabColTrabajoService,
    private toastr: ToastrService,
    private SpinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: data,
    public dialogRef: MatDialogRef<DialogDetalleColorComponent>
  ) { }

  recetaDetalle: any = null;
  previo: { codigo: number, nombre: string }[] = [];
  previoSeleccionado: number = 0;
  ngOnInit(): void {
    this.cargarReceta(this.data.corr_Carta, this.data.sec, this.data.correlativo);
    this.getListarPrevios();
  }

  ngAfterViewInit(): void {
    const dialogContainer = document.querySelector('.mat-dialog-container');
    if (dialogContainer) {
      dialogContainer.scrollTop = 0;
    }
  }

  cargarReceta(corrCarta: any, sec: number, correlativo: number): void {
    this.SpinnerService.show();
    this.LabColTraService.getCargarColoranteParaDetalle(corrCarta, sec, correlativo).subscribe({
      next: (response: any) => {
        if (response.success && response.totalElements > 0) {
          this.recetaDetalle = response.elements[0];
          //console.log('Receta cargada:', this.recetaDetalle);
          if(this.recetaDetalle?.previo) {
            this.recetaDetalle.previo = parseInt(this.recetaDetalle.previo);
            this.previoSeleccionado = this.recetaDetalle.previo;
          }
        }
        this.SpinnerService.hide();
      },
      error: () => {
        this.SpinnerService.hide();
        this.toastr.error('Error al cargar detalle de receta');
      }
    });
  }

  getListarPrevios(): void{
    this.LabColTraService.getListarPrevios().subscribe({
      next: (response: any) => {
        if(response.success){
          console.log('>>>>>>>>>>>>>>>>>>>>', response.elements);
          this.previo = response.elements.map((p: any) => ({
            codigo: p.pre_Id,
            nombre: p.pre_Des
          }));
        }
      }
    });
  }

  patchActualizarPrevio(): void {

    const data = {
      corr_Carta: this.data.corr_Carta,
      sec: this.data.sec,
      previo: this.previoSeleccionado
    }

    console.log('>>>>>>>>>>>>>>', data);

    this.LabColTraService.patchActualizarPrevio(data).subscribe({
      next: (response: any) => {
        // this.toastr.success(response.message, 'Exito', {
        //   timeOut: 2500
        // });
      },  
      error: (error: any) => {}
    });
  }

}
