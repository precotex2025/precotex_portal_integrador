import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { LabColTrabajoService } from '../../../services/lab-col-trabajo/lab-col-trabajo.service';

interface data_color{
  corr_Carta: string,
  sec: string
  descripcion_Color: string,
  cod_Color: string,
  estandar_Tono_Comer: string,
  formulado: string
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
    @Inject(MAT_DIALOG_DATA) public data: data,
    private LabColTrabajoService: LabColTrabajoService
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





}
