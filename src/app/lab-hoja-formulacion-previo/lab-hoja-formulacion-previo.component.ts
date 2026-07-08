import { Component, OnInit, ViewChild, ElementRef, Optional, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { DialogAgregarOpcionComponent } from './dialog-agregar-opcion/dialog-agregar-opcion.component';
// import { DialogInfoSdcComponent } from './dialog-info-sdc/dialog-info-sdc.component';
// import { DialogDetalleColorComponent } from './dialog-detalle-color/dialog-detalle-color.component';
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
// import { DialogEntregaAjusteComponent } from './dialog-entrega-ajuste/dialog-entrega-ajuste.component';
import { MatSelectChange } from '@angular/material/select';
import { DialogDetalleColorComponent } from '../lab-hoja-formulacion/dialog-detalle-color/dialog-detalle-color.component';
import { DialogInfoSdcComponent } from '../lab-hoja-formulacion/dialog-info-sdc/dialog-info-sdc.component';



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
  corr_Carta: any,
  sec: number,
  descripcion_Color: string,
  familia: string,
  tip_Ten: string,
  cod_Color: string
}

interface grillaDesplegable {
  corr_Carta: any,
  sec: number,
  des_Cliente: string,
  descripcion_Color: string,
  tipo: string,
  des_Tela: string,
  fec_creacion: string,
  fec_Entrega: string
}

interface data {
  corr_CartaR: any,
  secR: number,
  tip_TenR: string,
  cod_ColorR: string
  //familiaR: string
}
@Component({
  selector: 'app-lab-hoja-formulacion-previo',
  templateUrl: './lab-hoja-formulacion-previo.component.html',
  styleUrl: './lab-hoja-formulacion-previo.component.scss'
})
export class LabHojaFormulacionPrevioComponent implements OnInit {
  Usuario: string | null = null;
  grillaExpandible: Array<grillaDesplegable> = [];
  formulaciones: any[] = [];
  Corr_Carta_Remover: any = "";
  Sec_Remover: number = 0;
  Tipo_Receta_Remover: string = '';  

  TipoReceta: string = '';
  TipoTenido: { nombre: string, codigo: string }[] = [];
  Familia: string = '';
  Cod_Color: string = 'NO_COL';  
  mostrarPartidas: boolean = false;
  PartidasAgrupadas: string = '';
  PartidasAgrupadas_Tinto: string = '';  

    
  showRecetas = false;
  recetas: Array<receta> = [];
  recetaSeleccionada!: receta | undefined;


  filas = [
    { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
    { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },
    //{etiqueta: 'SAL', key: 'sal', tipo: 'numero' },
    { etiqueta: 'ENTREGADO', key: 'entregado', tipo: 'booleano' }
  ];  

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: data                   ,
  ){

  }

  ngOnInit() {

    console.log('carga inicial', this.data);
    this.onLlenarGrillaDesplegable(this.data.corr_CartaR, 1);

    //Espera unos segundos para que se cargue la grilla y luego carga la hoja de formulación
    // setTimeout(() => {
    //   this.TipoReceta = this.data.tip_TenR;
    //   this.onCargarGrillaHojaFormulacion(this.data.corr_CartaR, 1, this.TipoReceta);
      
    //   this.router.navigate([], {
    //     relativeTo: this.route,
    //     queryParams: {},
    //     replaceUrl: true
    //   });
    // }, 300);    

    // if (this.authService.isLoggedIn()) {
    //   this.Usuario = this.authService.getUsuario();
    // } else {
    //   this.router.navigate(['/login']);
    // }

  }

  //#region Funciones
  onLlenarGrillaDesplegable(Corr_Carta: any, Sec: number) {
    this.SpinnerService.show();
    this.grillaExpandible = [];
    this.LabColTrabajoService.getLlenarGrillaDesplegable(Corr_Carta, Sec).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('respuesta de la grilla desplegable', response.elements);
          this.grillaExpandible = response.elements;
          this.Familia = response.elements[0].familia;
          this.PartidasAgrupadas = response.elements[0].partidas;
          this.PartidasAgrupadas_Tinto = response.elements[0].partida_Agrupada_Tinto;//Nuevo

          const empiezaConLetra = /^[A-Za-z]/.test(this.data.corr_CartaR);
          this.mostrarPartidas = empiezaConLetra;
          
          if(!this.mostrarPartidas){
            this.PartidasAgrupadas = '';
            this.PartidasAgrupadas_Tinto = ''; //Nuevo
          }          


          // console.log('contenido que cargará en la grilla', this.grillaExpandible);
          this.getListarTiposTenido(this.Familia);
          this.SpinnerService.hide();
        }
      },
      error: (error) => {
        this.SpinnerService.hide();
      }
    });
  }  

  onCargarGrillaHojaFormulacion(Corr_Carta: any, Sec: number, TipoReceta: string) {
    //this.puedeEntregar = false;
    this.formulaciones = [];

    this.LabColTrabajoService.getCargarGridHojaFormulacion(Corr_Carta, Sec, TipoReceta).subscribe({
      next: (response: any) => {
        const correlativosMap = new Map<number, any>();

        response.elements.forEach((element: any) => {
          const estado = element.flg_Est_Lab;
          const estadoAutoLab = element.flg_Est_Autolab;
          const antipilling = element.antipilling;

          element.colorantes.forEach((c: any) => {
            const correlativo = c.correlativo;

            if (!correlativosMap.has(correlativo)) {
              correlativosMap.set(correlativo, {
                numeroColumna: correlativo,
                seleccionado: estado === '02',
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
                agu_Oxi: element.agu_Oxi ?? 0,
                flg_Est_Lab: estado ?? null,
                flg_Est_Autolab: estadoAutoLab ?? null,
                antipilling: antipilling ?? ''
              });
            }
            
            correlativosMap.get(correlativo).colorantes.push({
              col_Cod: c.col_Cod,
              col_Des: c.col_Des,
              por_Ini: c.por_Ini,
              por_Fin: c.por_Fin,
              por_Aju: c.por_Aju,
              id_secuencia: c.id_secuencia,
              orden: c.orden //Agregado por HMEDINA 05/06/2026
            });
            
          });
        });

        correlativosMap.forEach(f => {
          f.colorantes = f.colorantes.filter((c: any, index: number, arr: any[]) =>
            index === arr.findIndex(x => x.col_Cod === c.col_Cod)
          );

          // Orden descendente por id_secuencia
          f.colorantes.sort((a: any, b: any) => b.id_secuencia - a.id_secuencia);
        });

        console.log('Resultado de Mapeo', correlativosMap);

        // Asignar formulaciones ordenadas por correlativo descendente
        this.formulaciones = Array.from(correlativosMap.values())
          .sort((a, b) => Number(b.numeroColumna) - Number(a.numeroColumna));

        this.generarFilasDesdeColorantes();
      },
      error: () => {
        //this.toastr.error('Error al cargar formulaciones', '', { timeOut: 2500 });
      }
    });
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
    let corr_carta = this.data.corr_CartaR;
    let sec1 = 1;
    let tipotenido = this.TipoReceta;
    let dialogref = this.dialog.open(DialogDetalleColorComponent, {
      width: '700px',
      height: '700px',
      autoFocus: false,
      disableClose: false,
      panelClass: 'my-class',
      data: {
        corr_Carta: corr_carta,
        sec: sec1,
        correlativo: corre,
        tipoTenido: tipotenido
      }
    });
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
  
  onAbrirReporte(): void {
    if (this.data.corr_CartaR && this.TipoReceta) {
      this.dialog.closeAll();
      this.router.navigate(['Reporte'], {
        queryParams: {
          sdcE: this.data.corr_CartaR,
          secuenciaE: 1,//this.Sec_Remover,
          tipoRecetaE: this.TipoReceta
        }
      });
    } else {
      // alert('Por favor ingresa SDC y Secuencia'); 
    }
  }  

  onInformeSDC() {
    console.log(this.TipoReceta);
    let dialogref = this.dialog.open(DialogInfoSdcComponent, {
      width: '800px',
      height: '500px',
      autoFocus: false,
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: "Informacion",
        Num_SDC: this.data.corr_CartaR,
        Num_Sec: 1,
        TipoReceta: this.TipoReceta
      }
    });
  }  

  toggleRecetas() {
    this.showRecetas = !this.showRecetas;
  }  

  getListarTiposTenido(Familia: string): void {
    //Familia = this.FamiliaReferencia;
    this.LabColTrabajoService.getListarTiposTenido(Familia).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.TipoTenido = response.elements.map((t: any) => ({
              codigo: t.tip_Ten_Acr,
              nombre: t.tip_Ten_Des
            }));
            if (this.data.tip_TenR) {
              this.TipoReceta = this.data.tip_TenR;
            } else {
              this.TipoReceta = this.TipoTenido[0]?.codigo;
            }
            console.log(':>>>>>>>>>>>>>>>>>>:', this.TipoReceta);
            this.onCargarGrillaHojaFormulacion(this.data.corr_CartaR, 1, this.TipoReceta);
          }
        }
      },
      error: (error: any) => { }
    });
  }  

  generarFilasDesdeColorantes() {
    const filasColorantes: any[] = [];
    const auxiliaresMap = new Map<string, string>();

    this.formulaciones.forEach(f => {
      f.colorantes.forEach((c: any) => {
        if (c.col_Cod) {
          const yaExiste = filasColorantes.some(fc => fc.key === c.col_Cod);
          if (!yaExiste) {
            filasColorantes.push({
              etiqueta: c.col_Des?.trim() || c.col_Cod,
              key: c.col_Cod,
              tipo: 'numero',
              orden: c.orden //Agregado por HMEDINA 05-06-2026
            });
          }
        }
      });

      if (f.auxiliares) {
        f.auxiliares.forEach((aux: any) => {
          if (!auxiliaresMap.has(aux.col_Cod)) {
            auxiliaresMap.set(aux.col_Cod, aux.col_Des);
          }
        });
      }
    });

    filasColorantes.sort((a, b) => {
      const secA = this.formulaciones.flatMap(f => f.colorantes)
        .find(c => c.col_Cod === a.key)?.id_secuencia ?? 0;
      const secB = this.formulaciones.flatMap(f => f.colorantes)
        .find(c => c.col_Cod === b.key)?.id_secuencia ?? 0;
      return secA - secB;
    });

    const especiales = filasColorantes.filter(fc => fc.key === 'SAL' || fc.key === 'SULFATO');

    //Comentado por HMEDINA 05-06-2026
    //const otrosColorantes = filasColorantes.filter(fc => fc.key !== 'SAL' && fc.key !== 'SULFATO');

    //Agregado por HMEDINA 05-06-2026
    const otrosColorantes = filasColorantes
      .filter(fc => fc.key !== 'SAL' && fc.key !== 'SULFATO')
      .sort((a, b) => a.orden - b.orden);    

  
    if (this.TipoReceta === 'R') {
      this.filas = [
        { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
        { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },

        ...otrosColorantes,

        { etiqueta: 'SUMA TOTAL', key: 'sumaTotalColorantes', tipo: 'total' },

        ...especiales,

        ...Array.from(auxiliaresMap.entries()).map(([codigo, nombre]) => ({
          etiqueta: nombre,
          key: codigo,
          tipo: 'numero'
        })),

        { etiqueta: 'VOLUMEN', key: 'volumen', tipo: 'numero' },
        { etiqueta: 'PH INICIAL', key: 'cur_Jabo', tipo: 'numero' },
        { etiqueta: 'TIPO DESCARGA', key: 'fijado', tipo: 'texto' },
        { etiqueta: 'CANTIDAD JABONADO', key: 'can_Jabo', tipo: 'numero' },
        { etiqueta: 'PESO MUESTRA', key: 'pes_Mue', tipo: 'numero' },
        { etiqueta: 'ANTIPILLING', key: 'antipilling', tipo: 'texto' }
      ];
    } else if (this.TipoReceta === 'D') {
      this.filas = [
        { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
        { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },

        ...otrosColorantes,

        { etiqueta: 'SUMA TOTAL', key: 'sumaTotalColorantes', tipo: 'total' },

        ...especiales,

        ...Array.from(auxiliaresMap.entries()).map(([codigo, nombre]) => ({
          etiqueta: nombre,
          key: codigo,
          tipo: 'numero'
        })),

        { etiqueta: 'VOLUMEN', key: 'volumen', tipo: 'numero' },
        { etiqueta: 'PH INICIAL', key: 'cur_Jabo', tipo: 'numero' },
        { etiqueta: 'CANTIDAD LAVADOS', key: 'can_Jabo', tipo: 'numero' },
        { etiqueta: 'PESO MUESTRA', key: 'pes_Mue', tipo: 'numero' }
      ];
    } else {
      this.filas = [
        { etiqueta: 'DETALLE', key: 'detalle', tipo: 'texto' },
        { etiqueta: 'PROCEDENCIA', key: 'procedencia', tipo: 'texto' },

        ...otrosColorantes,

        { etiqueta: 'SUMA TOTAL', key: 'sumaTotalColorantes', tipo: 'total' },

        ...especiales,

        ...Array.from(auxiliaresMap.entries()).map(([codigo, nombre]) => ({
          etiqueta: nombre,
          key: codigo,
          tipo: 'numero'
        })),

        { etiqueta: 'VOLUMEN', key: 'volumen', tipo: 'numero' },
        { etiqueta: 'PH INICIAL', key: 'cur_Jabo', tipo: 'numero' },
        { etiqueta: 'AGUA OXIGENADA', key: 'agu_Oxi', tipo: 'numero' },
        { etiqueta: 'SODA CAUSTICA', key: 'sod_Gr', tipo: 'numero' },
        { etiqueta: 'PESO MUESTRA', key: 'pes_Mue', tipo: 'numero' }
      ];
    }
  }  

onCerrarReporte(): void {
  this.dialog.closeAll();
}  


}
