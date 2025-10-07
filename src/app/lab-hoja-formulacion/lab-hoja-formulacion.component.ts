import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarOpcionComponent } from './dialog-agregar-opcion/dialog-agregar-opcion.component';
import { DialogInfoSdcComponent } from './dialog-info-sdc/dialog-info-sdc.component';
import { DialogDetalleColorComponent } from './dialog-detalle-color/dialog-detalle-color.component';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


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
  seleccionado: boolean;
}

interface receta {
  corr_Carta: number,
  sec: number,
  descripcion_Color: string,
}

interface grillaDesplegable {
  corr_Carta: number,
  sec: number,
  des_Cliente: string,
  descripcion_Color: string,
  tipo: string,
  des_Tela: string,
  fec_creacion: string,
  fec_Entrega: string
}





@Component({
  selector: 'app-lab-hoja-formulacion',
  templateUrl: './lab-hoja-formulacion.component.html',
  styleUrl: './lab-hoja-formulacion.component.scss'
})
export class LabHojaFormulacionComponent implements OnInit{
  Corr_Carta_Remover: number = 0
  Sec_Remover: number = 0
  TituloEstado: string = ''
  @ViewChild(MatSort) sort!: MatSort;   
  constructor(
    private dialog: MatDialog,
    private LabColTrabajoService: LabColTrabajoService,
    private SpinnerService: NgxSpinnerService,
    private toastr: ToastrService
  ){}
  
  ngOnInit() {
    this.onLlenarDesplegable();
    // this.onCargarGrillaHojaFormulacion();
    // this.recetaSeleccionadaDesplegable();
    // console.log('la receta seleccionada es: ', localStorage.getItem('recetaSeleccionada')) 
  }


  recetaSeleccionadaDesplegable(){
    const guardada = localStorage.getItem('recetaSeleccionada');
    if (guardada) {
    const encontrada = this.recetas.find(r => r.corr_Carta.toString() === guardada);
    this.recetaSeleccionada = encontrada || this.recetas[0]; 
    this.Corr_Carta_Remover = this.recetaSeleccionada.corr_Carta;
    this.Sec_Remover = this.recetaSeleccionada.sec;
    this.onLlenarGrillaDesplegable(this.Corr_Carta_Remover, this.Sec_Remover);
    this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover);
    } else {
      this.recetaSeleccionada = this.recetas[0]; 
    }
  }
  showRecetas = true;
  recetas: Array<receta> = [];
  recetaSeleccionada!: receta | undefined;
  grillaExpandible: Array <grillaDesplegable> = [];
  seleccionarReceta(receta: receta) {
    this.recetaSeleccionada = receta;
    this.Corr_Carta_Remover = receta.corr_Carta;
    this.Sec_Remover = receta.sec;
    this.onLlenarGrillaDesplegable(this.Corr_Carta_Remover, this.Sec_Remover);
    this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover);
    localStorage.setItem('recetaSeleccionada', receta.corr_Carta.toString());
  }

  onLlenarDesplegable(){
    // localStorage.setItem('recetaSeleccionada', '');
    
    this.SpinnerService.show();
    this.recetas = [];
    this.LabColTrabajoService.getLlenarDesplegable().subscribe({
      next:(response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            console.log('Entrando al metodo');
            this.recetas = response.elements;
            this.recetaSeleccionadaDesplegable();            
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

  onLlenarGrillaDesplegable(Corr_Carta: number, Sec: number){
    this.SpinnerService.show();
    this.grillaExpandible = [];
    this.LabColTrabajoService.getLlenarGrillaDesplegable(Corr_Carta, Sec).subscribe({
      next:(response: any) => {
        if(response.success){
          this.grillaExpandible = response.elements;
            console.log('contenido que cargará en la grilla', this.grillaExpandible);
            this.SpinnerService.hide();
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })

  }

  onEntregarReceta(){
      this.TituloEstado = '¿Entregar Receta?'
      this.ActualizarEstado(this.TituloEstado, this.Corr_Carta_Remover, this.Sec_Remover, '02');
  }

  onRemoverDeHojaFormulacion(){
      this.TituloEstado = '¿Remover Receta?'
      this.ActualizarEstado(this.TituloEstado, this.Corr_Carta_Remover, this.Sec_Remover, '');
  }

  ActualizarEstado(titulo: string, corr_carta: number, sec: number, flg_est_lab: string){
      let Corr_Carta = 0
      let Sec = 0
      Swal.fire({
        title: titulo,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor:'#3085d6',
        cancelButtonColor:'#d33',
        confirmButtonText:'Si',
        cancelButtonText: 'No'
      }).then((result) =>{
        if(result.isConfirmed){
          const sCorr_Carta = corr_carta;
          const sSec = sec;
          const sFlg_Est_Lab = flg_est_lab;     
          let data: any = {
            "Corr_Carta": sCorr_Carta,
            "Sec": sSec,
            "Flg_Est_Lab": sFlg_Est_Lab
          };
          this.SpinnerService.show();
          this.LabColTrabajoService.patchActualizarEstadoDeColor(data).subscribe({
            next: (response: any) => {
              if(response.success){
                if(response.codeResult == 200){
                  this.onLlenarDesplegable();
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

  

  toggleRecetas() {
    this.showRecetas = !this.showRecetas;
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

  datosCabecera ={
    // sdc: this.recetas[0].corr_Carta,
    // fechaApertura: this.recetas[0]
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
        Num_SDC: this.Corr_Carta_Remover,
        Num_Sec: this.Sec_Remover
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetDatos()}
    );
  }

  onInformeSDC(){
    let dialogref = this.dialog.open(DialogInfoSdcComponent,{
      width:'500px',
      height: '700px',
      disableClose: false,
      panelClass: 'my-class',
      data:{
        Title: "Informacion",
        Num_SDC: this.Corr_Carta_Remover,
        Num_Sec: this.Sec_Remover
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetDatos()}
    );
  }


  // formulaciones = [
  // { numeroColumna: 5, detalle: 'VER', procedencia: 'OP 4', gold: 0.15, rojo: 0.19, azul: 0.35, sal: 40, sulfato: 30, cantidad: 3.2, ph: 6.34, autolab: true, entregado: false, seleccionado: false },
  // { numeroColumna: 4, detalle: 'VER', procedencia: 'DATA COLOR', gold: 0.12, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: true, seleccionado: false },
  // { numeroColumna: 3, detalle: 'VER', procedencia: 'OP 4', gold: 0.114, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: true, seleccionado: false },
  // { numeroColumna: 2, detalle: 'VER', procedencia: 'OP 4', gold: 0.12, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: false, seleccionado: false },
  // { numeroColumna: 1, detalle: 'VER', procedencia: 'DATA COLOR', gold: 0.114, rojo: 0.0139, azul: 0.35, sal: 40, sulfato: 30, cantidad: 2.4, ph: null, autolab: true, entregado: true, seleccionado: false }
  // ];

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

  agruparPorFormulacion(data: any[]): any[][] {
  const grupos: { [key: string]: any[] } = {};

  data.forEach(item => {
    const clave = '${item.corr_Carta}-${item.sec}-${item.correlativo}';
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(item);
  });

  return Object.values(grupos);
  }

  formulaciones: any[] = [];

  onCargarGrillaHojaFormulacion(Corr_Carta: number, Sec: number){
      this.LabColTrabajoService.getCargarGridHojaFormulacion(Corr_Carta, Sec).subscribe({
      next: (res: any) => {
      const agrupadas = this.agruparPorFormulacion(res.elements);
      this.formulaciones = agrupadas.map((grupo: any[], i: number) => ({
        colorantes: grupo,
        numeroColumna: (i + 1).toString(),
        seleccionado: false
      }));
      console.log('Formulaciones agrupadas:', this.formulaciones);
      },
      error: () => {
        this.toastr.error('Error al cargar formulaciones', '', { timeOut: 2500 });
      }
    });
  }

  getValor(formulacion: Formulacion, key: string): any {
  return (formulacion as any)[key];
  }

  verDetalle(formulacion: any): void {
    let dialogref = this.dialog.open(DialogDetalleColorComponent,{
      width:'700px',
      height: '700px',
      disableClose: false,
      panelClass: 'my-class',
      data:{
        Title: "Detalle Color",
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetDatos()}
    );
  // console.log('Detalle de formulación:', formulacion);

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

  getValorColorante(colorante: any, key: string): any {
  return colorante?.[key] ?? '';
  }

}
