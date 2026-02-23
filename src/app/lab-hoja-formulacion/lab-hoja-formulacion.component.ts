import { Component, OnInit, ViewChild, ElementRef, Optional, Inject } from '@angular/core';
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
import { response } from 'express';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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

interface data {
  corr_CartaR: number,
  secR: number
}

@Component({
  selector: 'app-lab-hoja-formulacion',
  templateUrl: './lab-hoja-formulacion.component.html',
  styleUrl: './lab-hoja-formulacion.component.scss'
})
export class LabHojaFormulacionComponent implements OnInit{
  usuario: string | null = null;
  Corr_Carta_Remover: number = 0
  Sec_Remover: number = 0
  TituloEstado: string = ''
  
  @ViewChild(MatSort) sort!: MatSort;   
  constructor(
    private dialog: MatDialog,
    private LabColTrabajoService: LabColTrabajoService,
    private SpinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
  ){}
  
  ngOnInit() {

    if (this.authService.isLoggedIn()) { 
      console.log('Usuario activo: -------', this.authService.getUsuario()); 
    } else { 
      this.router.navigate(['/login']); 
    }
    this.onLlenarDesplegable();
    //this.onGetParams();
  }

  onGetParams(): void {
    this.route.queryParams.subscribe(params => {
      this.data = {
        corr_CartaR: params['corr_CartaE'] !== undefined ? Number(params['corr_CartaE']) : 0,
        secR: params['secE'] !== undefined ? Number(params['secE']) : 0,
      };
    })
    if (this.data.corr_CartaR !== 0 && this.data.secR !== 0) {
      const encontrada = this.recetas.find(r => r.corr_Carta === this.data.corr_CartaR && r.sec === this.data.secR);
      if (encontrada) {
        this.recetaSeleccionada = encontrada;
        this.Corr_Carta_Remover = encontrada.corr_Carta;
        this.Sec_Remover = encontrada.sec;
        this.onLlenarGrillaDesplegable(this.Corr_Carta_Remover, this.Sec_Remover);
        this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover);
      }
    }
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
  
  showRecetas = false;
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
            //console.log('Entrando al metodo');
            this.recetas = response.elements;

            this.onGetParams();

            if (!this.recetaSeleccionada) { 
              this.recetaSeleccionadaDesplegable(); 
            }

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
      console.log('los indices son: ', this.indicesSeleccionados);
      Swal.fire({
        title: '¿Entregar Receta?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor:'#3085d6',
        cancelButtonColor:'#d33',
        confirmButtonText:'Si',
        cancelButtonText: 'No'
      }).then((result) =>{
        if(result.isConfirmed){  

          for (const item of this.indicesSeleccionados) {
            console.log('EL ITEM ES:-----------------',item);
            this.EntregarRecetaCabeceraColorante(this.Corr_Carta_Remover, this.Sec_Remover, '02');
            this.EntregarRecetaColorante(this.Corr_Carta_Remover, this.Sec_Remover, item, '02');

          }
        }
      })
  }

  onEnviarAutolab(index: number){
    const data = {
      Corr_Carta: this.Corr_Carta_Remover || 0,
      Sec: this.Sec_Remover || 0,
      Correlativo: index,
      Flg_Est_Autolab: '05'
    }

    this.LabColTrabajoService.patchActualizarEstadoDeColorTricomiaAutolab(data).subscribe({
      next: (response: any) => {
        let respuesta = '';
        respuesta = response.message;
        if(respuesta === 'ENVIADO A AUTOLAB'){
          this.toastr.success(response.message, '', {
            timeOut: 2500,
          });
        }else{
          this.toastr.warning(response.message, '', {
            timeOut: 2500,
          });
        }
        this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover);
      }
    })
  }

  onRemoverDeHojaFormulacion(){
      this.TituloEstado = '¿Remover Receta?'
      this.ActualizarEstado(this.TituloEstado, this.Corr_Carta_Remover, this.Sec_Remover, '09');
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
                  // this.onLlenarDesplegable();
                  // this.toastr.success(response.message, '', {
                  //   timeOut: 2500,
                  // });
                  this.onLlenarDesplegable();
                  const indexActual = this.recetas.findIndex(r => r.corr_Carta === this.Corr_Carta_Remover && r.sec === this.Sec_Remover); 
                  if (indexActual !== -1) { 
                    this.recetas.splice(indexActual, 1); 
                    let nuevaSeleccion: any = null; 
                    if (this.recetas[indexActual]) { 
                      nuevaSeleccion = this.recetas[indexActual]; 
                    }else if (this.recetas[indexActual - 1]) { 
                      nuevaSeleccion = this.recetas[indexActual - 1]; 
                    } if (nuevaSeleccion) { 
                      this.recetaSeleccionada = nuevaSeleccion; 
                      this.Corr_Carta_Remover = nuevaSeleccion.corr_Carta;
                      this.Sec_Remover = nuevaSeleccion.sec; 
                      this.onLlenarGrillaDesplegable(this.Corr_Carta_Remover, this.Sec_Remover); 
                      this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover); 
                    } else { 
                      this.recetaSeleccionada = undefined; 
                      this.Corr_Carta_Remover = 0; 
                      this.Sec_Remover = 0; 
                      this.toastr.warning('No quedan recetas disponibles', 'Advertencia', { timeOut: 3000 }); 
                    }
                  }
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
  
  EntregarRecetaCabeceraColorante(corr_carta: number, sec: number, flg_est_lab: string){
    const sCorr_Carta = corr_carta;
    const sSec = sec;
    const sFlg_Est_Lab = flg_est_lab;     
    let data: any = {
      "Corr_Carta": sCorr_Carta,
      "Sec": sSec,
      "Flg_Est_Lab": sFlg_Est_Lab
    };
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
  EntregarRecetaColorante(corr_carta: number, sec: number, correlativo: number, flg_est_lab: string){
    const sCorr_Carta = corr_carta;
    const sSec = sec;
    const sCorrelativo = correlativo;
    const sFlg_Est_Lab = flg_est_lab;     
    let data: any = {
      "Corr_Carta": sCorr_Carta,
      "Sec": sSec,
      "Correlativo": sCorrelativo,
      "Flg_Est_Lab": sFlg_Est_Lab
    };

    // console.log('------------------', data);
    // console.log(sCorr_Carta);
    // console.log(sSec);
    // console.log(sFlg_Est_Lab);
    this.SpinnerService.show();
    this.LabColTrabajoService.patchActualizarEstadoDeColorTricomia(data).subscribe({
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

  datosCabecera = {};
  
  // onAgregarOpcion(){
  //   let correlativo: number =  this.getCorrelativoMayor() ;
  //   if(correlativo === -Infinity){
  //     correlativo = 0;
  //   }
  //   console.log('el correlativo cuando no hay columnas es: ', correlativo);
  //   let dialogref = this.dialog.open(DialogAgregarOpcionComponent,{
  //     width:'1800px',
  //     height: '700px',
  //     disableClose: false,
  //     panelClass: 'my-class',
  //     data:{
  //       Title: "Detalle",
  //       Num_SDC: this.Corr_Carta_Remover,
  //       Num_Sec: this.Sec_Remover,
  //       Correlativo: correlativo
  //     }
  //   });
  //   dialogref.afterClosed().subscribe(result =>
  //   { this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover) }
  //   );
  // }

  onAgregarOpcion(){

    let correlativo: number =  this.getCorrelativoMayor() ;
    console.log('el correlativo cuando no hay columnas es: ', correlativo);
    if(correlativo === -Infinity){
      correlativo = 0;
    }
    
    this.router.navigate(['AgregarOpcion'], 
      { queryParams: {
          accionR: 'Insertar',
          Num_SDC: this.Corr_Carta_Remover,
          Num_Sec: this.Sec_Remover,
          Correlativo: correlativo,
          CorrelativoAnterior: 0
      }}
    )    
  }

  onInformeSDC(){
    let dialogref = this.dialog.open(DialogInfoSdcComponent,{
      width:'800px',
      height: '500px',
      autoFocus: false,
      disableClose: false,
      panelClass: 'my-class',
      data:{
        Title: "Informacion",
        Num_SDC: this.Corr_Carta_Remover,
        Num_Sec: this.Sec_Remover
      }
    });
  }

  filas = [
    { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
    { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },
    //{etiqueta: 'SAL', key: 'sal', tipo: 'numero' },
    { etiqueta: 'ENTREGADO', key: 'entregado', tipo: 'booleano' }
  ];


formulaciones: any[] = [];

onActualizarHojaFormulacion(): void {
  this.onLlenarDesplegable();
  this.onCargarGrillaHojaFormulacion(this.Corr_Carta_Remover, this.Sec_Remover);
}

onCargarGrillaHojaFormulacion(Corr_Carta: number, Sec: number) {
  this.puedeEntregar = false;
  this.formulaciones = [];

  this.LabColTrabajoService.getCargarGridHojaFormulacion(Corr_Carta, Sec).subscribe({
    next: (response: any) => {
      const correlativosMap = new Map<number, any>();
      console.log('--------------------------', response.elements);
      response.elements.forEach((element: any) => {
        const estado = element.flg_Est_Lab;
        const estadoAutoLab = element.flg_Est_Autolab;

        element.colorantes.forEach((c: any) => {
          const correlativo = c.correlativo;

          if (!correlativosMap.has(correlativo)) {
            correlativosMap.set(correlativo, {
              numeroColumna: correlativo,
              seleccionado: estado === '02' ? true : false,
              colorantes: [],
              procedencia: element.procedencia,
              sod_Gr: element.sod_Gr,
              car_Gr: element.car_Gr,
              volumen: element.volumen,
              fijado: element.fijado,
              cur_Jabo: element.cur_Jabo,
              can_Jabo: element.can_Jabo,
              acidulado: element.acidulado,
              pes_Mue: element.pes_Mue,
              flg_Est_Lab: estado ?? null,
              flg_Est_Autolab: estadoAutoLab ?? null
            });
          }
          
          correlativosMap.get(correlativo).colorantes.push({
            col_Cod: c.col_Cod,
            col_Des: c.col_Des,
            por_Ini: c.por_Ini,
            por_Fin: c.por_Fin,
            por_Aju: c.por_Aju,
            id_secuencia: c.id_secuencia
          });
        });
      });
      
      correlativosMap.forEach(f => {
        f.colorantes.sort((a: any, b: any) => a.col_Des.localeCompare(b.col_Des));
      });    
      
      this.formulaciones = Array.from(correlativosMap.values())
        .sort((a, b) => Number(b.numeroColumna) - Number(a.numeroColumna));
      console.log('Formulaciones generadas:', this.formulaciones.map(f => ({
                  correlativo: f.numeroColumna,
                  estado: f.flg_Est_Autolab
                })));

            
      this.formulaciones.forEach(f => {
        console.log(`Columna ${f.numeroColumna}:`, f.colorantes.map((c: any) => ({
          codigo: c.col_Cod,
          nombre: c.col_Des,
          valor: c.por_Fin
        })));
      });

      this.generarFilasDesdeColorantes();
    },
    error: () => {
      this.toastr.error('Error al cargar formulaciones', '', { timeOut: 2500 });
    }

    
  });
}

generarFilasDesdeColorantes(): void {
  const coloranteMap = new Map<string, string>();
  const auxiliaresMap = new Map<string, string>();

  this.formulaciones.forEach(f => {
    f.colorantes.forEach((c: any) => {
      if (c.col_Cod && c.col_Des) {
        const nombre = c.col_Des.toUpperCase();
        if (nombre.includes('SAL') || nombre.includes('SULFATO')) {
          auxiliaresMap.set(c.col_Cod, c.col_Des);
        } else {
          coloranteMap.set(c.col_Cod, c.col_Des);
        }
      }
    });
  });

  this.filas = [
    { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
    { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },
    
    //PRIMERO LOS COLORANTES    
    ...Array.from(coloranteMap.entries()).map(([codigo, nombre]) => ({
      etiqueta: nombre,
      key: codigo,
      tipo: 'numero'
    })),

    //SUMA DEL VALOR DE LOS COLORANTES
    { etiqueta: 'SUMA TOTAL', key: 'sumaTotalColorantes', tipo: 'total'},


    //LUEGO LOS AUXILIARES SAL Y SULFATO
    ...Array.from(auxiliaresMap.entries()).map(([codigo, nombre]) => ({
      etiqueta: nombre,
      key: codigo,
      tipo: 'numero'
    })),

    //DESPUES COMPLETAMOS LA INFO
    { etiqueta: 'VOLUMEN', key: 'volumen', tipo: 'numero' },
    { etiqueta: 'PH INICIAL', key: 'cur_Jabo', tipo: 'numero' },
    { etiqueta: 'TIPO DESCARGA', key: 'fijado', tipo: 'texto' },
    { etiqueta: 'CANTIDAD JABONADO', key: 'can_Jabo', tipo: 'numero' },
    { etiqueta: 'PESO MUESTRA', key: 'pes_Mue', tipo: 'numero' }
  ];
}

  getSumaTotalColorantes(f: any): number {
  return f.colorantes
    .filter((c: any) => c.por_Fin != null && !c.col_Des.toUpperCase().includes('SAL') && !c.col_Des.toUpperCase().includes('SULFATO'))
    .reduce((acc: number, c: any) => acc + Number(c.por_Fin), 0);
  }

  getValorColorantePorCodigo(colorantes: any[], cod: string): number | null {  
    const c = colorantes.find(c => c.col_Cod?.trim().toUpperCase() === cod.trim().toUpperCase());
    return c ? c.por_Fin : null;
  }
  
  getValor(formulacion: Formulacion, key: string): any {
  return (formulacion as any)[key] ?? '';
  }
  
  verDetalle(formulacion: any): void {
    let corre = formulacion.numeroColumna;
    let corr_carta = this.Corr_Carta_Remover;
    let sec1 = this.Sec_Remover;
    let dialogref = this.dialog.open(DialogDetalleColorComponent,{
      width:'700px',
      height: '700px',
      autoFocus: false,
      disableClose: false,
      panelClass: 'my-class',
      data:{
        corr_Carta: corr_carta,
        sec: sec1,
        correlativo: corre,
      }
    });
  }

  // copiarFormulacion(index: number): void {
  //   const original = this.formulaciones[index];

  //   //BUSCAMOS EL INDEX MAYOR
  //   const maxNumero = Math.max(...this.formulaciones.map(f => f.numeroColumna ?? 0));

  //   // //COPIAR DATOS
  //   // const copia = {
  //   //   ...original,
  //   //   numeroColumna: maxNumero + 1,
  //   // };
  //   const numeroColumna = maxNumero + 1;

  //   // //BUSQUEDA DEL INDEX MAYOR
  //   // const destinoIndex = this.formulaciones.findIndex(f => f.numeroColumna === maxNumero);

  //   // //PEGAR DATOS COPIADOS
  //   // this.formulaciones.splice(destinoIndex, 0, copia);

  //   // const data = {
  //   //       corr_Carta: this.Corr_Carta_Remover,
  //   //       sec: this.Sec_Remover,
  //   //       correlativo: index
  //   //     }

  //   // this.LabColTrabajoService.postCopiarOpcionColorante(data).subscribe({
  //   //   next: (response: any) =>{
  //   //     this.onActualizarHojaFormulacion();
  //   //   }
  //   // });

  //   console.log('El nuevo correlativo para la copia es: ', numeroColumna);
  //   console.log('El correlativo original para la copia es: ', original.numeroColumna);
  //   this.router.navigate(['AgregarOpcion'], 
  //     { queryParams: {
  //         accionR: 'Copiar',
  //         Num_SDC: this.Corr_Carta_Remover,
  //         Num_Sec: this.Sec_Remover,
  //         Correlativo: numeroColumna,
  //         CorrelativoAnterior: original.numeroColumna
  //     }}
  //   )
  // }

  copiarFormulacion(correlativoAnterior: number): void {
  const original = this.formulaciones.find(f => f.numeroColumna === correlativoAnterior);
  const maxNumero = Math.max(...this.formulaciones.map(f => f.numeroColumna ?? 0));
  const numeroColumna = maxNumero + 1;
  this.router.navigate(['AgregarOpcion'], {
    queryParams: {
      accionR: 'Copiar',
      Num_SDC: this.Corr_Carta_Remover,
      Num_Sec: this.Sec_Remover,
      Correlativo: numeroColumna,
      CorrelativoAnterior: correlativoAnterior
    }
  });
}


  borrarFormulacion(index: number, f:any): void {
    
    if(f.flg_Est_Autolab !== null){
            this.toastr.warning('No se puede eliminar una corrida que ya fue enviada a Autolab', '', {
              timeOut: 2500,
            });
            return;
          }
    
    Swal.fire({
        title: '¿Desea eliminar la corrida?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor:'#3085d6',
        cancelButtonColor:'#d33',
        confirmButtonText:'Si',
        cancelButtonText: 'No'
      }).then((result) =>{
        if(result.isConfirmed){  

          this.LabColTrabajoService.deleteEliminarOpcionColorante(this.Corr_Carta_Remover, this.Sec_Remover, index).subscribe({
            next: (response: any) => {
              this.onActualizarHojaFormulacion();
            }
          });
        }
      })
    
  }

  getValorColorante(colorante: any, key: string): any {
  return colorante?.[key] ?? '';
  }

  getCorrelativoMayor(): number {
    return Math.max(...this.formulaciones.map(f => Number(f.numeroColumna)));
  }

  indicesSeleccionados: number[] = [];
  puedeEntregar = false;

  toggleSeleccion(index: number): void {
    const i = this.indicesSeleccionados.indexOf(index);
    if (i >= 0) {
      this.indicesSeleccionados.splice(i, 1);
    } else {
      this.indicesSeleccionados.push(index);
    }

    this.puedeEntregar = this.indicesSeleccionados.length > 0;
  } 

}
