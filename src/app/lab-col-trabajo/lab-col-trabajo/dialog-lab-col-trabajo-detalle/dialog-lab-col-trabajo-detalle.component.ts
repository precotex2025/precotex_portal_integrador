import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { LabColTrabajoService } from '../../../services/lab-col-trabajo/lab-col-trabajo.service';
import Swal from 'sweetalert2';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface data_color{
  corr_Carta: string,
  sec: string,
  descripcion_Color: string,
  cod_Color: string,
  estandar_Tono_Comer: string,
  formulado: string,
  Flg_Est_Lab: string
}

interface data{
  Num_SDC: number
}

@Component({
  selector: 'app-dialog-lab-col-trabajo-detalle',
  templateUrl: './dialog-lab-col-trabajo-detalle.component.html',
  styleUrl: './dialog-lab-col-trabajo-detalle.component.scss'
})
export class DialogLabColTrabajoDetalleComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;   
  constructor(
    private SpinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: data,
    private LabColTrabajoService: LabColTrabajoService,
    public dialogRef: MatDialogRef<DialogLabColTrabajoDetalleComponent>,
  ){}
  ngOnInit(): void {
    this.onGetDetalle();
  }

  displayedColumns: string[] = [
    'num_sec',
    'color',
    'est_ton_com',
    'formulado',
    'HojaFormulacion'
  ];

  dataSource: MatTableDataSource<data_color> = new MatTableDataSource();
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataListadoDetalle: Array<any> = [];

  pintarEnvio(row: any): string {
    const est_lab = row.flg_Est_Lab;
    if(est_lab === '04'){
      return 'Color-Verde'
    }else{
      return 'Color-Negro';
    }
  }

  onGetDetalle(){
    let Corr_Carta = this.data.Num_SDC;
    console.log(Corr_Carta);
    this.SpinnerService.show();
    this.dataListadoDetalle = [];
    this.LabColTrabajoService.getListaSDCDetalle(Corr_Carta).subscribe({
      next:(response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            this.dataListadoDetalle = response.elements;
            console.log(this.dataListadoDetalle);
            this.dataSource.data = this.dataListadoDetalle;
            this.dataSource.sort = this.sort;
            this.SpinnerService.hide();
          }else{
            this.SpinnerService.hide();
          };
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })
  }

  onEnviarAHojaFormulacion(){
    let Corr_Carta = this.dataListadoDetalle[0].corr_Carta;
    let Sec = this.dataListadoDetalle[0].sec;
    Swal.fire({
      title: "¿Desea Registrar el Retiro?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor:'#3085d6',
      cancelButtonColor:'#d33',
      confirmButtonText:'Si',
      cancelButtonText: 'No'
    }).then((result) =>{
      if(result.isConfirmed){
        const sCorr_Carta = Corr_Carta;
        const sSec = Sec;     
        let data: any = {
          "Corr_Carta": sCorr_Carta,
          "Sec": sSec
        };
        this.SpinnerService.show();
        this.LabColTrabajoService.postRegistrarDetalleColorSDC(data).subscribe({
          next: (response: any) => {
            if(response.success){
              if(response.codeResult == 200){
                this.onGetDetalle();
                this.toastr.success(response.message, '', {
                  timeOut: 2500,
                });
              }else if(response.codeResult == 201){
                this.toastr.info(response.message, '', {
                  timeOut: 2500,
                });
              }
              this.SpinnerService.hide();
            }else{
              this.toastr.error(response.message, 'Cerrar', {
                timeOut:2500
              });
              this.SpinnerService.hide();
            }
          },
          error:(error) => {
            this. SpinnerService.hide();
            this.toastr.error(error.message, 'Cerrar', {
              timeOut: 2500
            });
          }
        })
      }
    })
  }

}
