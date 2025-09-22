import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarOpcionComponent } from './dialog-agregar-opcion/dialog-agregar-opcion.component';

@Component({
  selector: 'app-lab-hoja-formulacion',
  templateUrl: './lab-hoja-formulacion.component.html',
  styleUrl: './lab-hoja-formulacion.component.scss'
})
export class LabHojaFormulacionComponent implements OnInit{
  
  constructor(
    private dialog: MatDialog
  ){}
  ngOnInit() {
    const guardada = localStorage.getItem('recetaSeleccionada');
    this.recetaSeleccionada = guardada || this.recetas[0];
  }

  // displayedColumns: string[] =  [
  //   'cliente',
  //   'num_sdc',
  //   'des_tela',
  //   'fec_asig',
  //   'dias_lab',
  //   'fec_comp',
  //   'dias_comp',
  //   'estado',
  //   'detalle',
  // ]

  // columnsToDisplay: string[] = this.displayedColumns.slice();

  showRecetas = true;
  recetas = ['SDC 1520 ROJO', 'SDC 1521 VERDE', 'SDC 1522 AZUL'];
  recetaSeleccionada = '';

  toggleRecetas() {
    this.showRecetas = !this.showRecetas;
  }

  seleccionarReceta(receta: string) {
    this.recetaSeleccionada = receta;
    localStorage.setItem('recetaSeleccionada', receta);
  }

  sdcData = {
  sdc: 1520,
  fechaApertura: new Date('2025-01-02'),
  fechaEntrega: new Date('2025-01-20'),
  cliente: 'YMATEX S.A.C',
  tipo: 'LAB-DIPS',
  color: 'ROJO',
  articulo: 'JERSEY F/SPANDEX 40/1 X 22 - 20 n 240 - 0 GRM ALG 97% / SPX 3% OSCURO'
  };

  onGetDatos(){}
  
  onAgregarOpcion(){
    
    let dialogref = this.dialog.open(DialogAgregarOpcionComponent,{
      width:'1800px',
      height: '700px',
      disableClose: false,
      panelClass: 'my-class',
      data:{
        Title: "Detalle",
        // Num_SDC: num_sdc
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetDatos()}
    );
  }

}
