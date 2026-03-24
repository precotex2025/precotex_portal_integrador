import { Component, OnInit, ViewChild, TemplateRef, Inject } from '@angular/core';
import { LabDosificacionComponent } from '../lab-dosificacion/lab-dosificacion.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from '../lab-dosificacion/dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService, provideSpinnerConfig } from 'ngx-spinner';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { MatSelectChange } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { DialogDetalleColorComponent } from '../lab-hoja-formulacion/dialog-detalle-color/dialog-detalle-color.component';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NonNullableFormBuilder } from '@angular/forms';
import { response } from 'express';
import { log } from 'console';
interface data_colaautolab {
  corr_Carta: any,
  sec: number,
  correlativo: number,
  descripcion_Color: string,
  jab_Des: string,
  volumen: number
}

interface data_dispensado {
  corr_Carta: any,
  sec: number,
  correlativo: number,
  descripcion_Color: string,
  jab_Des: string,
  volumen: number,
  sal: string,
  sulfato: string,
  peso_Muestra: number,
  ph_Ini: number,
}

@Component({
  selector: 'app-lab-disp-autolab',
  templateUrl: './lab-disp-autolab.component.html',
  styleUrl: './lab-disp-autolab.component.scss'
})
export class LabDispAutolabComponent implements OnInit {
  @ViewChild('modalPosiciones') modalPosiciones!: TemplateRef<any>;
  // @ViewChild('modalListaSeleccionados') modalListaSeleccionados!: TemplateRef<any>;
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatSort) sort!: MatSort;
  Usuario: string = '';
  constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    //@Inject(MAT_DIALOG_DATA) public data: any

  ) { }
  posiciones: { numero: number, seleccionado: boolean, ocupado: boolean }[] = [];
  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      //console.log('Usuario activo: -------', this.authService.getUsuario());
      this.Usuario = this.authService.getUsuario()!;
    } else {
      this.router.navigate(['/login']);
    }

    this.posiciones = Array.from({ length: 19 }, (_, i) => ({
      numero: i + 1, seleccionado: false, ocupado: false
    }));

    this.ahibaSeleccionado = 0;
    this.onListarColaAutolab(this.Usuario);
    // this.onListarDispensado();
  }

  estadoSeleccionado: 'cola' | 'dispensado' = 'cola';

  columnsToDisplay: string[] = [
    'seleccion',
    'corr_Carta',
    'sec',
    'correlativo',
    'descripcion_Color',
    'ingreso_Manual',
    'jab_Des',
    'volumen'
  ];

  dataSource: MatTableDataSource<data_colaautolab> = new MatTableDataSource();

  toggleAllRows(checked: boolean): void {
    this.dataSource.data.forEach((row: any) => row.seleccionado = checked);
  }


  isAllSelected(): boolean {
    return this.dataSource.data.every((row: any) => row.seleccionado);
  }

  isIndeterminate(): boolean {
    const selected = this.dataSource.data.filter((row: any) => row.seleccionado);
    return selected.length > 0 && selected.length < this.dataSource.data.length;
  }

  dataListadoColaAutolab = [];
  onListarColaAutolab(Usr_Cod: string) {

    this.SpinnerService.show();
    this.dataListadoColaAutolab = [];
    this.LabColTrabajoService.getListarColaAutolab(Usr_Cod).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('elementos en el listado de cola autolab: ', response.elements);
          this.dataListadoColaAutolab = response.elements.map((colita: any) => ({
            ...colita,
            seleccionado: false
          }));
          this.dataSource.data = this.dataListadoColaAutolab;
          this.dataSource.sort = this.sort;

          this.dataSource.data.forEach(row => {
            this.cargarItemsManuales(row);
          });

          //this.table.renderRows(); 

          this.SpinnerService.hide();
        }
      },
      error: (error) => {
        this.SpinnerService.hide();
      }
    })
  }

  haySeleccionados(): boolean {
    return this.dataSource.data.some((row: any) => row.seleccionado);
  }

  async enviarADispensar(): Promise<void> {
    const seleccionados = this.dataSource.data.filter((row: any) => row.seleccionado);

    const confirmacion = await Swal.fire({
      title: '¿Enviar a Dispensar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });

    if (!confirmacion.isConfirmed) return;

    this.SpinnerService.show();

    try {
      for (let i = 0; i < seleccionados.length; i++) {
        const item = seleccionados[i];
        const dataEnviar = {
          corr_Carta: item.corr_Carta,
          sec: item.sec,
          correlativo: item.correlativo,
          posicion: 0
        };
        try {
          const respuesta = await this.LabColTrabajoService.patchEnviarADispensado(dataEnviar).toPromise();
        } catch (error) {
          console.log('Error al enviar a dispensado:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      const dataEnviar = {
        corr_Carta: "",
        sec: 0,
        correlativo: 0,
        posicion: 0
      };

      try {
        const exitoso = await this.LabColTrabajoService.patchEnviarAutolab(dataEnviar).subscribe({});
      } catch (error) {
        console.log('Error al enviar a Autolab:', error);
      }

      if (this.estadoSeleccionado === 'cola') {
        this.onListarColaAutolab(this.Usuario);
      }

    } finally {
      this.SpinnerService.hide();
    }
  }




  cambiarEstado(valor: 'cola' | 'dispensado'): void {
    this.estadoSeleccionado = valor;
    if (this.estadoSeleccionado === 'cola') {
      this.onListarColaAutolab(this.Usuario);
    } else if (this.estadoSeleccionado === 'dispensado') {
      this.onListarDispensado(this.Usuario);
      this.listarAhibas();
    }
  }

  // cargarItemsManuales(row: any): string{
  //   let Corr_Carta: number = row.corr_Carta
  //   let Sec: number = row.sec
  //   let Correlativo: number = row.correlativo
  //   if(row.ingreso_Manual){
  //     this.LabColTrabajoService.getListarIngresoManual(Corr_Carta, Sec, Correlativo).subscribe({
  //       next: (response: any) => {
  //         if (response.success) {
  //         console.log(row.ingreso_Manual);
  //         row.ingreso_Manual = response.elements
  //           .map((x: any) => x.ingreso_Manual);
  //         }
  //       }
  //     })
  //   }
  //   return 'Sin ingreso manual';
  // }

  cargarItemsManuales(row: any): void {
    const { corr_Carta, sec, correlativo } = row;

    this.LabColTrabajoService.getListarIngresoManual(corr_Carta, sec, correlativo).subscribe({
      next: (response: any) => {
        if (response.success) {
          row.ingreso_Manual = response.elements
            .map((x: any) => x.ingreso_Manual)
        } else {
          row.ingreso_Manual = 'Ingreso Automático';
        }
      },
      error: () => {
        row.ingreso_Manual = 'Error al cargar';
      }
    });
  }


  /*****************************************************/



  ahibaSeleccionado: number = 1;
  curvasAhiba: { codigo: number, nombre: string, cantidadPosiciones: number, estado: string }[] = [];

  dataSourceDispensado: MatTableDataSource<data_dispensado> = new MatTableDataSource();

  columnsToDisplayDispensado: string[] = [
    'seleccionDispensado',
    'corr_Carta',
    'descripcion_Color',
    'jab_Des',
    'volumen',
    'sal',
    'sulfatoreal',
    // 'sulfato', 
    // 'soda',
    'ingreso_Manual',
    'pes_Mue',
    'sec',
    'correlativo',
    'ph_Ini',
    'detalle',
    'reenvio'
  ];


  dataListadoDispensado = [];
  onListarDispensado(Usr_Cod: string) {
    this.SpinnerService.show();
    this.dataListadoDispensado = [];
    this.LabColTrabajoService.getListarDispensado(Usr_Cod).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('elementos en el listado de dispensado: ', response.elements);
          this.dataListadoDispensado = response.elements.map((dispensado: any) => ({
            ...dispensado,
            seleccionado: false
          }));
          this.dataSourceDispensado.data = this.dataListadoDispensado;
          this.dataSourceDispensado.sort = this.sort;

          this.dataSourceDispensado.data.forEach(row => {
            this.cargarItemsManuales(row);
          });

          //this.table.renderRows();

          this.SpinnerService.hide();
        }
      },
      error: (error) => {
        this.SpinnerService.hide();
      }
    })
  }

  // toggleAll(checked: boolean): void {
  //   this.dataSourceDispensado.data.forEach((row: any) => row.seleccionado = checked);
  // }

  // isAllSelectedDispensado(): boolean {
  //   return this.dataSourceDispensado.data.every((row: any) => row.seleccionado);
  // }

  // isIndeterminateDispensado(): boolean {
  //   const selected = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);
  //   return selected.length > 0 && selected.length < this.dataSourceDispensado.data.length;
  // }

  toggleAll(checked: boolean): void {
    this.dataSourceDispensado.data
      .filter((row: any) => row.ph_Ini !== 0) // solo habilitados
      .forEach((row: any) => row.seleccionado = checked);
  }

  isAllSelectedDispensado(): boolean {
    const enabledRows = this.dataSourceDispensado.data.filter((row: any) => row.ph_Ini !== 0);
    return enabledRows.every((row: any) => row.seleccionado);
  }

  isIndeterminateDispensado(): boolean {
    const enabledRows = this.dataSourceDispensado.data.filter((row: any) => row.ph_Ini !== 0);
    const selected = enabledRows.filter((row: any) => row.seleccionado);
    return selected.length > 0 && selected.length < enabledRows.length;
  }


  haySeleccionadosDispensados(): boolean {
    return this.dataSourceDispensado.data.some((row: any) => row.seleccionado);
  }

  async cargarAAHIBA(): Promise<void> {

    const seleccionados = this.posiciones
      .filter(p => p.seleccionado)
      .map(p => p.numero);
    const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);
      // console.log('-------------------------', seleccionados);
      // console.log('-------------------------', seleccionadas);

    if (seleccionados.length === 0) {
      console.log('No hay tubos seleccionados');
      return;
    }

    if (seleccionadas.length === 0) {
      console.log('No hay elementos seleccionados');
      return;
    }
    

    const confirmacion = await Swal.fire({
      title: '¿Cargar a Ahiba?',
      html: `Se cargarán a la AHIBA #${this.ahibaSeleccionado}<br><br>Fecha de carga: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });

    if (!confirmacion.isConfirmed) return;

    this.SpinnerService.show();

    try {
      for (let i = 0; i < seleccionadas.length; i++) {
        const item = seleccionadas[i];
        const tubo = seleccionados[i];
        // console.log('el tubito es:------------', tubo);
        const dataEnviar = {
          corr_Carta: item.corr_Carta,
          sec: item.sec,
          correlativo: item.correlativo,
          ahi_Id: this.ahibaSeleccionado,
          nro_Tubo: tubo
        };

        try {
          const respuesta: any = await this.LabColTrabajoService.patchCargarAahiba(dataEnviar).toPromise();
          if (respuesta?.message === 'AHIBA LLENA') {
            this.toastr.warning(respuesta.message, '', { timeOut: 3000 });
            break;
          }

          this.toastr.success(respuesta.message || 'Cargado correctamente', '', { timeOut: 2000 });
        } catch (error) {
          this.toastr.error('Error al cargar en AHIBA');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (this.estadoSeleccionado === 'dispensado') {
        this.onListarColaAutolab(this.Usuario);
      }

    } finally {
      this.ahibaSeleccionado = 0;
      this.dialog.closeAll();
      this.SpinnerService.hide();
      this.onListarDispensado(this.Usuario);
    }


  }


  verReceta(row: any): void {
    let corre = row.correlativo;
    let corr_carta = row.corr_Carta;
    let sec1 = row.sec;

    let dialogref = this.dialog.open(DialogDetalleColorComponent, {
      width: '700px',
      //height: '700px',
      maxHeight: '700px',
      autoFocus: false,
      disableClose: false,
      panelClass: 'my-class',
      data: {
        corr_Carta: corr_carta,
        sec: sec1,
        correlativo: corre,
      }
    });
  }


  onCreate(): void {
    let num_sdc = 0;
    const ahiba = this.curvasAhiba.find(c => c.codigo === this.ahibaSeleccionado);
    let estado = ahiba?.estado
    console.log(':::::::::::::::::::::::.', ahiba);
    let dialogref = this.dialog.open(LabDosificacionComponent, {
      width: '900px',
      height: '500px',
      autoFocus: false,
      disableClose: false,
      maxWidth: 'none',
      panelClass: 'my-class',
      data: {
        Title: "Detalle",
        Num_SDC: "",
        Estado: estado
      }
    });
  }

  ingresarPH(row: any): void {
    let num_sdc = row.corr_Carta;
    let sec = row.sec;
    let correlativo = row.correlativo;
    let dialogref = this.dialog.open(DialogAgregarPhComponent, {
      width: '500px',
      height: '300px',
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: "PH Inicio",
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        Condicion: 1
      }
    });

    dialogref.afterClosed().subscribe(result => {
      this.onListarDispensado(this.Usuario);
    });
  }

  listarAhibas(): void {
    this.SpinnerService.show();
    this.curvasAhiba = [];
    this.LabColTrabajoService.getListaAhibas().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            console.log('las ahibas son: ', response.elements);
            this.curvasAhiba = response.elements.map((c: any) => ({
              codigo: c.ahi_Id,
              nombre: c.ahi_Des,
              cantidadPosiciones: c.ahi_Pos_Can,
              estado: c.ahi_Est_Pro
            }));
            this.SpinnerService.hide();
          } else {
            this.curvasAhiba = [];
            this.SpinnerService.hide();
          }
        } else {
          this.curvasAhiba = [];
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

  validarEstadoahibaPorCodigo(codigo: number): Promise<number> {
    this.SpinnerService.show();

    return new Promise((resolve, reject) => {
      this.LabColTrabajoService.getListaAhibas().subscribe({
        next: (response: any) => {
          if (response.success && response.totalElements > 0) {
            this.curvasAhiba = response.elements.map((c: any) => ({
              codigo: c.ahi_Id,
              nombre: c.ahi_Des,
              cantidadPosiciones: c.ahi_Pos_Can,
              estado: c.ahi_Est_Pro
            }));

            const ahibaEncontrada = this.curvasAhiba.find(c => c.codigo === codigo);

            if (ahibaEncontrada) {
              if (ahibaEncontrada.estado === 'I') {
                resolve(1);
              } else {
                resolve(0);
              }
            } else {
              this.toastr.error('No se encontró la ahiba con ese código');
              resolve(0);
            }

            this.SpinnerService.hide();
          } else {
            this.curvasAhiba = [];
            this.SpinnerService.hide();
            resolve(0);
          }
        },
        error: (error: any) => {
          this.SpinnerService.hide();
          console.log(error.error.message, 'Cerrar', { timeout: 2500 });
          reject(error);
        }
      });
    });
  }



  cantidadRequerida: number = 0;
  seleccionadosActuales: number = 0;

  ahiSeleccionadoNombre: string = '';

  // onSeleccionarAhiba(event: MatSelectChange): void {
  //   this.ahibaSeleccionado = event.value;
  //   console.log('Código seleccionado:', this.ahibaSeleccionado);
  //   const ahiba = this.curvasAhiba.find(c => c.codigo === event.value);

  //   this.ahiSeleccionadoNombre = ahiba!.nombre;

  //   if (this.ahibaSeleccionado > 0) {

  //     console.log('---------------------------------------------', ahiba!.estado);
  //     if (ahiba!.estado === 'I') {
  //       this.toastr.warning('La ahiba ya cuenta con un proceso iniciado');
  //     }else{
  //       this.abrirModalPosiciones(ahiba!.cantidadPosiciones, ahiba!.nombre);
  //     }

  //   }

  // }

  async onSeleccionarAhiba(event: MatSelectChange): Promise<void> {
    this.ahibaSeleccionado = event.value;
    console.log('Código seleccionado:', this.ahibaSeleccionado);

    const ahiba = this.curvasAhiba.find(c => c.codigo === event.value);

    this.ahiSeleccionadoNombre = ahiba!.nombre;

    const estado = await this.validarEstadoahibaPorCodigo(this.ahibaSeleccionado);

    if (this.ahibaSeleccionado > 0) {

      if (estado === 1) {
        this.toastr.warning('La ahiba ya cuenta con un proceso iniciado');
      } else {
        this.abrirModalPosiciones(ahiba!.cantidadPosiciones, ahiba!.nombre);
      }
    }
  }

  seleccionadasModal: any[] = [];
  // abrirModalPosiciones(cantidad: number, ahiNombre: string) {
  //   const cantidadSeleccionada = this.dataSourceDispensado.data
  //     .filter((row: any) => row.seleccionado).length;

  //   if (cantidadSeleccionada > cantidad) {
  //     this.toastr.error(
  //       `La AHIBA ${ahiNombre} solo permite ${cantidad} tubos. Ha seleccionado ${cantidadSeleccionada}.`,
  //       'Error', { timeOut: 3000 }
  //     );
  //     this.ahibaSeleccionado = 0;
  //     return;
  //   }

  //   this.cantidadRequerida = cantidadSeleccionada;
  //   if (this.cantidadRequerida > 0) {
  //     const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);
  //     const jabDesReferencia = seleccionadas[0].jab_Des;
  //     const todosIguales = seleccionadas.every((row: any) => row.jab_Des === jabDesReferencia);

  //     if (!todosIguales) {
  //       this.ahibaSeleccionado = 0;
  //       this.toastr.error('Los registros seleccionados deben tener la misma curva teñido', 'Error', {
  //         timeOut: 3000
  //       });
  //       return;
  //     }
  //   }

  //   this.seleccionadosActuales = 0;
  //   this.posiciones = Array.from({ length: cantidad }, (_, i) => ({
  //     numero: i + 1,
  //     seleccionado: false,
  //     ocupado: false
  //   }));

  //   if (this.cantidadRequerida == 0) {
  //     this.toastr.warning('Seleccione al menos un item', 'Advertencia', {
  //       timeOut: 3000
  //     });
  //     this.ahibaSeleccionado = 0;
  //     return;
  //   }

  //   const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);

  //   // this.seleccionadasModal = [{ corr_Carta: 10025, descripcion_Color: 'WASHED BLACK' }, { corr_Carta: 10165, descripcion_Color: 'BLUE MIRAGE' }];

  //   this.seleccionadasModal = seleccionadas.map((item: any) => ({
  //     ...item,
  //     tubo: ''
  //   }));

  //   this.listarDosificacionesXAhiba(this.ahibaSeleccionado);

  //   this.dialog.open(this.modalPosiciones, {
  //     width: '900px',
  //     height: '585px'
  //   });
  //   // ahiNombre,
  // }

  // abrirModalPosiciones(cantidad: number, ahiNombre: string) {
  //   const cantidadSeleccionada = this.dataSourceDispensado.data
  //     .filter((row: any) => row.seleccionado).length;

  //   if (cantidadSeleccionada > cantidad) {
  //     this.toastr.error(
  //       `La AHIBA ${ahiNombre} solo permite ${cantidad} tubos. Ha seleccionado ${cantidadSeleccionada}.`,
  //       'Error', { timeOut: 3000 }
  //     );
  //     this.ahibaSeleccionado = 0;
  //     return;
  //   }

  //   this.cantidadRequerida = cantidadSeleccionada;
  //   if (this.cantidadRequerida > 0) {
  //     const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);

  //     const curvas = [...new Set(this.dataListadoDosificaciones.map(item => item.cur_Des))];

  //     const curva11 = '11_AVITERA / SUNFIX / NOVACRON OCEANO S-R 60°C';
  //     const curva14 = '14_AVITERA/SUNFIX MEDIOS – OSCUROS - DIFICILES';
  //     const curva81 = '81_TURQUESAS 50°-80°C';
  //     const curva96 = '96_TURQUESAS 95°-80°C';

  //     if (curvas.length > 2) {
  //       this.toastr.error('Solo se permiten máximo 2 curvas distintas', 'Error', { timeOut: 3000 });
  //       this.ahibaSeleccionado = 0;
  //       return;
  //     }

  //     if (curvas.length === 2) {
  //       if (curvas.includes(curva11) && curvas.includes(curva14)) {
  //       }
  //       else if (curvas.includes(curva81) && curvas.includes(curva96)) {
  //       }
  //       else {
  //         this.toastr.error('La combinación de curvas seleccionada no está permitida', 'Error', { timeOut: 3000 });
  //         this.ahibaSeleccionado = 0;
  //         return;
  //       }
  //     } else if (curvas.length === 1) {
  //       this.tituloCurva = curvas[0] || '';
  //     }
  //   }

  //   this.seleccionadosActuales = 0;
  //   this.posiciones = Array.from({ length: cantidad }, (_, i) => ({
  //     numero: i + 1,
  //     seleccionado: false,
  //     ocupado: false
  //   }));

  //   if (this.cantidadRequerida == 0) {
  //     this.toastr.warning('Seleccione al menos un item', 'Advertencia', {
  //       timeOut: 3000
  //     });
  //     this.ahibaSeleccionado = 0;
  //     return;
  //   }

  //   const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);

  //   this.seleccionadasModal = seleccionadas.map((item: any) => ({
  //     ...item,
  //     tubo: ''
  //   }));

  //   this.listarDosificacionesXAhiba(this.ahibaSeleccionado);

  //   this.dialog.open(this.modalPosiciones, {
  //     width: '900px',
  //     height: '585px'
  //   });
  // }

  abrirModalPosiciones(cantidad: number, ahiNombre: string) {
    const cantidadSeleccionada = this.dataSourceDispensado.data
      .filter((row: any) => row.seleccionado).length;

    if (cantidadSeleccionada > cantidad) {
      this.toastr.error(
        `La AHIBA ${ahiNombre} solo permite ${cantidad} tubos. Ha seleccionado ${cantidadSeleccionada}.`,
        'Error', { timeOut: 3000 }
      );
      this.ahibaSeleccionado = 0;
      return;
    }

    this.cantidadRequerida = cantidadSeleccionada;
    if (this.cantidadRequerida > 0) {
      const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);

      const curvas = [...new Set(seleccionadas.map((row: any) => row.jab_Des))];
      const curva11 = '11_AVITERA / SUNFIX / NOVACRON OCEANO S-R 60°C';
      const curva14 = '14_AVITERA/SUNFIX MEDIOS – OSCUROS - DIFICILES';
      const curva81 = '81_TURQUESAS 50°-80°C';
      const curva96 = '96_TURQUESAS 95°-80°C';

      if (curvas.length > 2) {
        this.toastr.error('Solo se permiten máximo 2 curvas distintas', 'Error', { timeOut: 3000 });
        this.ahibaSeleccionado = 0;
        return;
      }

      if (curvas.length === 2) {
        if ((curvas.includes(curva11) && curvas.includes(curva14)) ||
          (curvas.includes(curva81) && curvas.includes(curva96))) {
        } else {
          this.toastr.warning('La combinación de curvas seleccionada no está permitida', 'Error', { timeOut: 3000 });
          this.ahibaSeleccionado = 0;
          return;
        }
      }
    }

    this.seleccionadosActuales = 0;
    this.posiciones = Array.from({ length: cantidad }, (_, i) => ({
      numero: i + 1,
      seleccionado: false,
      ocupado: false
    }));

    if (this.cantidadRequerida == 0) {
      this.toastr.warning('Seleccione al menos un item', 'Advertencia', {
        timeOut: 3000
      });
      this.ahibaSeleccionado = 0;
      return;
    }

    const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);

    this.seleccionadasModal = seleccionadas.map((item: any) => ({
      ...item,
      tubo: ''
    }));

    this.listarDosificacionesXAhiba(this.ahibaSeleccionado);

    this.dialog.open(this.modalPosiciones, {
      width: '900px',
      height: '585px'
    });
  }



  toggleSeleccion(pos: any): void {
    // Si ya estaba seleccionado, lo desmarcamos
    if (pos.seleccionado) {
      pos.seleccionado = false;
      this.seleccionadosActuales = this.posiciones.filter(p => p.seleccionado).length;

      // limpiar el tubo asignado en la lista
      const index = this.seleccionadasModal.findIndex(i => i.tubo === pos.numero);
      if (index !== -1) {
        this.seleccionadasModal[index].tubo = '';
      }
      return;
    }

    // Validar cantidad máxima
    if (this.seleccionadosActuales >= this.cantidadRequerida) {
      this.toastr.warning('Ya alcanzó la cantidad requerida de tubos');
      return;
    }

    // Marcar como seleccionado
    pos.seleccionado = true;
    this.seleccionadosActuales = this.posiciones.filter(p => p.seleccionado).length;

    // asignar el número de tubo al siguiente item en la lista
    if (this.seleccionadosActuales <= this.seleccionadasModal.length) {
      this.seleccionadasModal[this.seleccionadosActuales - 1].tubo = pos.numero;
    }
  }




  // getTransform(index: number, total: number): string {
  //   const angle = (360 / total) * index; 
  //   const radius = 120; 
  //   return `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;
  // }

  getTransform(index: number, total: number): string {
    const step = 360 / total;
    const angle = step * (index + 1) - 90;
    const radius = 220;

    return `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`;
  }

  onCancelar(): void {
    this.ahibaSeleccionado = 0;
    this.dialog.closeAll();
  }


  aplicarFiltrarTodo(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.estadoSeleccionado === 'cola') {
      this.dataSource.filter = filterValue;
    } else {
      this.dataSourceDispensado.filter = filterValue;
    }
  }

  limpiarSeleccion(): void {

    this.posiciones.forEach(p => p.seleccionado = false);

    this.seleccionadosActuales = 0;

    this.seleccionadasModal.forEach(item => item.tubo = '');
  }





  tubos: { numero: number, ocupado: boolean }[] = [];
  dataListadoDosificaciones: any[] = [];
  tituloCurva: string = '';

  listarDosificacionesXAhiba(Ahi_Id: number): void {
    this.SpinnerService.show();
    this.dataListadoDosificaciones = [];
    this.LabColTrabajoService.getListarItemsEnAhiba(Ahi_Id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.dataListadoDosificaciones = response.elements as any[];
          this.dataSource.data = this.dataListadoDosificaciones;
          this.dataSource.sort = this.sort;

          this.posiciones.forEach(p => p.ocupado = false);

          const tubosUnicos = Array.from(
            new Set(
              this.dataListadoDosificaciones
                .filter(item => item.nro_Tubo && item.nro_Tubo > 0)
                .map(item => item.nro_Tubo)
            )
          );

          tubosUnicos.forEach(nro => {
            const pos = this.posiciones.find(p => p.numero === nro);
            if (pos) pos.ocupado = true;
          });

          this.SpinnerService.hide();
        } else {
          this.dataListadoDosificaciones = [];
        }
      },
      error: (error: any) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', { timeout: 2500 });
      }
    });
  }


  patchActualizarEstadoDeColorTricomia(row: any): void {
    let Corr_Carta: string = row.corr_Carta;
    let Sec: number = row.sec;
    let Correlativo: number = row.correlativo;

    const data = {
      corr_Carta: Corr_Carta,
      sec: Sec,
      correlativo: Correlativo,
      flg_Est_Lab: '05'
    }

    //console.log('la data para reenviar es:::::::::::::::::::::....', data);

    this.LabColTrabajoService.patchActualizarEstadoDeColorTricomia(data).subscribe({
      next: (response: any) => {
        this.onListarDispensado(this.Usuario);
      },
      error: (error: any) => {

      }
    });
  }



}
