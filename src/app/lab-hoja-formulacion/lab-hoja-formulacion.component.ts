import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarOpcionComponent } from './dialog-agregar-opcion/dialog-agregar-opcion.component';

interface Formulacion {
  numeroColumna: number;
  // nombre: string;
  detalle: string;
  procedencia: string;
  gold: number;
  rojo: number;
  azul: number;
  sal: number;
  sulfato: number;
  cantidad: number;
  ph: number | null;
  autolab: boolean;
  entregado: boolean;
}

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
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetDatos()}
    );
  }


  formulaciones = [
  { numeroColumna: 5, detalle: 'VER', procedencia: 'OP 4', gold: 0.15, rojo: 0.19, azul: 0.35, sal: 40, sulfato: 30, cantidad: 3.2, ph: 6.34, autolab: true, entregado: false },
  { numeroColumna: 4, detalle: 'VER', procedencia: 'DATA COLOR', gold: 0.12, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: true },
  { numeroColumna: 3, detalle: 'VER', procedencia: 'OP 4', gold: 0.114, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: true },
  { numeroColumna: 2, detalle: 'VER', procedencia: 'OP 4', gold: 0.12, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: false },
  { numeroColumna: 1, detalle: 'VER', procedencia: 'DATA COLOR', gold: 0.114, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: true }
  ];

filas = [
  { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
  { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },
  { etiqueta: 'AVITERA GOLD SE', key: 'gold', tipo: 'numero' },
  { etiqueta: 'AVITERA ROJO CLARO SE', key: 'rojo', tipo: 'numero' },
  { etiqueta: 'AVITERA AZUL CLARO SE', key: 'azul', tipo: 'numero' },
  { etiqueta: 'SAL', key: 'sal', tipo: 'numero' },
  { etiqueta: 'SULFATO', key: 'sulfato', tipo: 'numero' },
  { etiqueta: 'CANTIDAD (gr)', key: 'cantidad', tipo: 'numero' },
  { etiqueta: 'PH INICIAL TEÑIDO', key: 'ph', tipo: 'numero' },
  { etiqueta: 'ENVIADO A AUTOLAB', key: 'autolab', tipo: 'booleano' },
  { etiqueta: 'ENTREGADO', key: 'entregado', tipo: 'booleano' }
];

  getValor(formulacion: Formulacion, key: string): any {
  return (formulacion as any)[key];
  }

  verDetalle(formulacion: any): void {

  console.log('Detalle de formulación:', formulacion);

  }

  borrarFormulacion(index: number): void {
  this.formulaciones.splice(index, 1);
  }

  // @ViewChild('formulacionesGrid') gridRef!: ElementRef;

  // ngAfterViewInit(): void {
  //   const numCols = this.formulaciones.length;
  //   this.gridRef.nativeElement.style.setProperty('--num-columns', numCols.toString());
  // }

  copiarFormulacion(index: number): void {
    const original = this.formulaciones[index];

    //BUSCAMOS EL INDEX MAYOR
    const maxNumero = Math.max(...this.formulaciones.map(f => f.numeroColumna ?? 0));

    //COPIAR DATOS
    const copia = {
      ...original,
      numeroColumna: maxNumero + 1,
    };

    //BUSQUEDA DEL INDEX MAYOR
    const destinoIndex = this.formulaciones.findIndex(f => f.numeroColumna === maxNumero);

    //PEGAR DATOS COPIADOS
    this.formulaciones.splice(destinoIndex, 0, copia);
  }



}
