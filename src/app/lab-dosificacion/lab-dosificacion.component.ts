import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from './dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { compileDeclareClassMetadata } from '@angular/compiler';
import { endWith } from 'rxjs';
import { getJSON } from 'jquery';


interface RegistroDosificacion {
  id_ensp: number;
  sec: number;
  color: string;
  curva: string;
  dosificaciones: number[]; // máximo 3
  pm_final?: number;
}

interface data_dosificacion {
corr_Carta: number,
sec: number,
correlativo: number,
descripcion_Color: string,
jab_Des: string,
volumen: number,
dosificacion1: number,
dosificacion2: number,
dosificacion3: number,
ph_Fin: string
}

@Component({
  selector: 'app-lab-dosificacion',
  templateUrl: './lab-dosificacion.component.html',
  styleUrl: './lab-dosificacion.component.scss'
})
export class LabDosificacionComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private changeDetectorRef: ChangeDetectorRef
  ){}

  dataSource: MatTableDataSource<data_dosificacion> = new MatTableDataSource();
  // registros: RegistroDosificacion[] = [];

  menuItems: {codigo: number, nombre: string} [] = [];

  columnas: string[] = [];

  ngOnInit(): void {
    this.listarAhibas();
    this.listarDosificacionesXAhiba(1);
  }

  columnsToDisplay: string[] = [
    'corr_Carta',
    'sec',
    'correlativo',
    'descripcion_Color',
    'jab_Des',
    'dosificacion1',
    'dosificacion2',
    'dosificacion3',
    'ph_Fin'   
    ];

  ingresarPH(row: any): void{
      let num_sdc = row.corr_Carta;
      let sec = row.sec;
      let correlativo = row.correlativo;

      let dialogref = this.dialog.open(DialogAgregarPhComponent, {
        width:'500px',
        height: '300px',
        disableClose: false,
        panelClass: 'my-class',
        data:{
          Title: "PH Final",
          Corr_Carta: num_sdc,
          Sec: sec,
          Correlativo: correlativo,
          Condicion: 2
        }
      });
  }

listarAhibas(): void{
    this.SpinnerService.show();
    this.menuItems = [];
    this.LabColTrabajoService.getListaAhibas().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            this.menuItems = response.elements.map((c: any) => ({
              codigo: c.ahi_Id,
              nombre: c.ahi_Des
            }));

            this.seleccionarAhiba(this.menuItems[0]);

            this.SpinnerService.hide();
          }else{
            this.menuItems = [];
            this.SpinnerService.hide();
          }
        }else{
          this.menuItems = [];
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
  
  itemSeleccionado: any = null;

  seleccionarAhiba(item: any): void {
    this.itemSeleccionado = item;
    let nroAhiba = item.codigo;
    this.changeDetectorRef.detectChanges();
    this.listarDosificacionesXAhiba(nroAhiba);
  }

dataListadoDosificaciones = [];
listarDosificacionesXAhiba(Ahi_Id: number): void{
    this.SpinnerService.show();
    this.dataListadoDosificaciones = [];
    this.LabColTrabajoService.getListarItemsEnAhiba(Ahi_Id).subscribe({
      next: (response: any) => {
        if(response.success){
            this.dataListadoDosificaciones = response.elements;
            this.dataSource.data = this.dataListadoDosificaciones;
            this.dataSource.sort = this.sort;
            this.SpinnerService.hide();
        }else{
          this.dataListadoDosificaciones = [];
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
