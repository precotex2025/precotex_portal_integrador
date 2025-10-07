import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner'; 
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { DialogLabColTrabajoDetalleComponent } from './dialog-lab-col-trabajo-detalle/dialog-lab-col-trabajo-detalle.component';



interface data_cola_trab{
  corr_Carta: number
}

@Component({
  selector: 'app-lab-col-trabajo',
  templateUrl: './lab-col-trabajo.component.html',
  styleUrl: './lab-col-trabajo.component.scss'
})
export class LabColTrabajoComponent implements OnInit{

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor
  (
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private SpinnerService: NgxSpinnerService,
    private LabColaTrabajoService: LabColTrabajoService,
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient
  ){ }

  range = new FormGroup({
    start: new FormControl(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: new FormControl(new Date),
  });
  
  ngOnInit(): void {
    this.onGetListaSDC();
  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] =  [
    'cliente',
    'num_sdc',
    'des_tela',
    'fec_asig',
    'dias_lab',
    'fec_comp',
    'dias_comp',
    'estado',
    'detalle',
  ]

  dataSource: MatTableDataSource<data_cola_trab> = new MatTableDataSource();
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataListadoSDC: Array<any> = [];
  estadoSeleccionado: string = '01';

  filtrarPorEstado() {
  
  }

  onGetListaSDC(){
      const startControl = this.range.get('start');
      const endControl = this.range.get('end');
      const fecIni: Date | null = startControl?.value ?? null;
      const fecFin: Date | null = endControl?.value ?? null;

    
    if(fecIni == null || fecFin == null){
      this.matSnackBar.open("Ingrese Rango de Fechas", "Cerrar",
        {horizontalPosition:'center', verticalPosition:'top', duration: 1500}
      );
      return;
    }else{
    let estado: string = this.estadoSeleccionado;
    this.SpinnerService.show();
    this.dataListadoSDC = [];
    this.LabColaTrabajoService.getListaSDCPorEstado(estado, fecIni, fecFin).subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){         
            this.dataListadoSDC = response.elements;
            this.dataSource.data = this.dataListadoSDC;
            this.dataSource.sort = this.sort;
            this.SpinnerService.hide();
          }else{
            this.dataListadoSDC = [];
            this.dataSource.data = [];
            this.SpinnerService.hide();
          }
        }else{
          this.dataListadoSDC = [];
          this.dataSource.data = [];
        }
      },
      error: (error: any) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', {
          timeout: 2500
        })
      }
    })
   }


  }

  getColorClase(row: any): string {
    const dias = row.dias_Falt_Compromiso;
    if(this.estadoSeleccionado === '01'){
      if (dias <= 0) {
        return 'fila-roja';      // YA SE PASARON
      } else if (dias <= 3) {
        return 'fila-amarilla';   // TIEMPO AJUSTADO
      } else {
        return 'fila-verde';       // TIEMPO DE SOBRA
      }
    }else{
      return '';
    }

  }

  onCreate(objeto: any){

    let num_sdc = objeto.corr_Carta;

    let dialogref = this.dialog.open(DialogLabColTrabajoDetalleComponent, {
      width:'1500px',
      height: '700px',
      disableClose: false,
      panelClass: 'my-class',
      data:{
        Title: "Detalle",
        Num_SDC: num_sdc
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetListaSDC()}
    );
  }

}
