import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { DialogLabColTrabajoDetalleComponent } from './dialog-lab-col-trabajo-detalle/dialog-lab-col-trabajo-detalle.component';
import { GlobalVariable } from '../../VarGlobals';
import { AuthService } from '../../authentication/auth.service';
import Swal from 'sweetalert2';


interface data_cola_trab {
  corr_Carta: any
}

interface data_cola_trab_produccion {
  corr_Carta: any
}

@Component({
  selector: 'app-lab-col-trabajo',
  templateUrl: './lab-col-trabajo.component.html',
  styleUrl: './lab-col-trabajo.component.scss'
})
export class LabColTrabajoComponent implements OnInit {
  usuario: string | null = null;
  Usuario: string = '';
  @ViewChild('sortLabDips') sortLabDips!: MatSort;
  @ViewChild('sortProduccion') sortProduccion!: MatSort;
  @ViewChild('paginatorLabDips') paginatorLabDips!: MatPaginator;
  @ViewChild('paginatorProduccion') paginatorProduccion!: MatPaginator;
  @ViewChild('modalEnviar') modalEnviar!: TemplateRef<any>;
  //usuario = '';
  constructor
    (
      private dialog: MatDialog,
      private formBuilder: FormBuilder,
      private matSnackBar: MatSnackBar,
      private SpinnerService: NgxSpinnerService,
      private LabColaTrabajoService: LabColTrabajoService,
      private toastr: ToastrService,
      private router: Router,
      private http: HttpClient,
      private authService: AuthService
    ) { }

  range = new FormGroup({
    start: new FormControl(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)),
    end: new FormControl(new Date),
  });

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      // console.log('Usuario activo: -------', this.authService.getUsuario());
      this.Usuario = this.authService.getUsuario()!;
    } else {
      this.router.navigate(['/login']);
    }
    this.usuario = this.authService.getUsuario();
    // console.log('EL USUARIO EN ESTE PUNTO ES: ---------', this.usuario);
    // this.onGetListaSDC();
    // this.getObtenerDatosProduccion();
    this.estadoSeleccionado = '01';
    this.estadoSeleccionadoChild = '04';
    this.BuscadorRadio();
    this.getLlenarDesplegableProduccion(this.Usuario);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginatorLabDips;
    this.dataSource.sort = this.sortLabDips;

    this.dataSourceProduccion.paginator = this.paginatorProduccion;
    this.dataSourceProduccion.sort = this.sortProduccion;
  }

  displayedColumns: string[] = [
    'detalle',
    'cliente',
    'num_sdc',
    'des_tela',
    //'fec_asig',
    //'dias_lab',
    'fec_comp',
    'creacion',
    'dias_comp',
    'estado',
    'entregado'
  ]

  displayedColumnsProduccion: string[] = [
    'detalle',
    'cliente',
    'num_sdc',
    'des_tela',
    'fec_comp',
    //'dias_comp',
    'cod_Color',
    'des_Color',
    'partidas',
    'estado',
    'reformular'
  ]

  dataSource: MatTableDataSource<data_cola_trab> = new MatTableDataSource();
  dataSourceProduccion: MatTableDataSource<data_cola_trab_produccion> = new MatTableDataSource();
  //dataSource = new MatTableDataSource<any>([]);
  //dataSourceProduccion = new MatTableDataSource<any>([]);
  columnsToDisplay: string[] = this.displayedColumns.slice();
  columnsToDisplayProduccion: string[] = this.displayedColumnsProduccion.slice();
  dataListadoSDC: Array<any> = [];
  dataListadoProduccion: Array<any> = [];
  estadoSeleccionado: string = '01';
  estadoSeleccionadoChild: string = '04'
  curvas: { codigo: string, descripcion: string }[] = [];
  curvaSeleccionada: string = '';
  curvasDescripcion: { codigo: string, descripcion: string, tipo: string }[] = [];
  curvaSeleccionadaDes: string = '';
  dialogRef1!: MatDialogRef<any>;
  curvasSeleccionadasDes: any[] = [];

  filtrarPorEstado() { }

  BuscadorRadio(): void {
    if (this.estadoSeleccionado == '01') {
      if (this.estadoSeleccionadoChild == '05') {
        this.getObtenerDatosProduccion();
      } else {
        this.onGetListaSDC();
      }
    } else if (this.estadoSeleccionado == '02') {
      if (this.estadoSeleccionadoChild == '05') {
        this.getObtenerDatosProduccion();
      } else {
        this.onGetListaSDC();
      }
    } else {

    }
  }



  onGetListaSDC() {
    const startControl = this.range.get('start');
    const endControl = this.range.get('end');
    const fecIni: Date | null = startControl?.value ?? null;
    const fecFin: Date | null = endControl?.value ?? null;


    if (fecIni == null || fecFin == null) {
      return;
    } else {
      let estado: string = this.estadoSeleccionado;
      this.SpinnerService.show();
      this.dataListadoSDC = [];
      this.LabColaTrabajoService.getListaSDCPorEstado(estado, fecIni, fecFin, this.usuario!).subscribe({
        next: (response: any) => {
          if (response.success) {
            if (response.totalElements > 0) {
              this.dataListadoSDC = response.elements;
              //console.log('dataListadoSDC: ', this.dataListadoSDC);
              this.dataSource.data = this.dataListadoSDC;
              this.dataSource.sort = this.sortLabDips;
              this.SpinnerService.hide();
            } else {
              this.dataListadoSDC = [];
              this.dataSource.data = [];
              this.SpinnerService.hide();
            }
          } else {
            this.dataListadoSDC = [];
            this.dataSource.data = [];
            this.SpinnerService.hide();
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

  getObtenerDatosProduccion(): void {
    const startControl = this.range.get('start');
    const endControl = this.range.get('end');
    const fecIni: Date | null = startControl?.value ?? null;
    const fecFin: Date | null = endControl?.value ?? null;


    if (fecIni == null || fecFin == null) {

      return;
    } else {
      let estado: string = this.estadoSeleccionado;
      this.SpinnerService.show();
      this.dataListadoProduccion = [];
      this.LabColaTrabajoService.getObtenerDatosProduccion(estado, fecIni, fecFin, this.usuario!).subscribe({
        next: (response: any) => {
          if (response.success) {
            if (response.totalElements > 0) {
              this.dataListadoProduccion = response.elements;
              console.log('dataListadoProduccion: -------------------------', this.dataListadoProduccion);
              this.dataSourceProduccion.data = this.dataListadoProduccion;
              this.dataSourceProduccion.sort = this.sortProduccion;
              this.SpinnerService.hide();
            } else {
              this.dataListadoProduccion = [];
              this.dataSourceProduccion.data = [];
              this.SpinnerService.hide();
            }
          } else {
            this.dataListadoProduccion = [];
            this.dataSourceProduccion.data = [];
            this.SpinnerService.hide();
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

  // getColorClase(row: any): string {
  //   const dias = row.dias_Falt_Compromiso;
  //   if (this.estadoSeleccionado === '01') {
  //     if (dias <= 0) {
  //       return 'fila-roja';      // YA SE PASARON
  //     } else if (dias <= 3) {
  //       return 'fila-amarilla';   // TIEMPO AJUSTADO
  //     } else {
  //       return 'fila-verde';       // TIEMPO DE SOBRA
  //     }
  //   } else {
  //     return '';
  //   }

  // }

//   getColorClase(row: any): string {
//   const hoy = new Date();
//   const fechaCompromiso = new Date(row.fec_compromiso);

//   // Diferencia en días entre hoy y la fecha de compromiso
//   const diasDiff = Math.floor((fechaCompromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

//   // Condiciones
//   if (diasDiff > 3) {
//     return 'fila-verde'; // faltan más de 3 días
//   } else if (diasDiff < -3) {
//     return 'fila-rojo'; // ya pasaron más de 3 días
//   } else {
//     return 'fila-amarillo'; // intervalo intermedio
//   }
// }

// getColorClase(row: any): string {
//   const hoy = new Date();

//   // Fechas que vienen como DateTime del backend
//   const fechaCompromiso = new Date(row.fec_compromiso);
//   const fechaCreacion = new Date(row.fec_creacion);

//   // Diferencia en días con fecha de compromiso
//   const diasCompromiso = Math.floor((fechaCompromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

//   // Diferencia en días desde la fecha de creación
//   const diasCreacion = Math.floor((hoy.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));

//   // --- PRIORIDAD: Fecha de compromiso ---
//   if (diasCompromiso > 3) {
//     return 'fila-verde';   // faltan más de 3 días
//   } else if (diasCompromiso < -3) {
//     return 'fila-rojo';    // ya pasaron más de 3 días
//   } else if (diasCompromiso >= -3 && diasCompromiso <= 3) {
//     return 'fila-amarillo'; // intervalo intermedio
//   }

//   // --- Si no aplica compromiso, usamos fecha de creación ---
//   if (diasCreacion <= 4) {
//     return 'fila-verde';   // han pasado 4 o menos días desde creación
//   } else if (diasCreacion >= 7) {
//     return 'fila-rojo';    // ya pasaron 7 días o más desde creación
//   } else {
//     return 'fila-amarillo'; // intermedio entre 5 y 6 días
//   }
// }

getColorClase(row: any): string {
  const hoy = new Date();
  const fechaCompromiso = new Date(row.fec_compromiso);
  const fechaCreacion = new Date(row.fec_creacion);

  const diasCompromiso = Math.floor((fechaCompromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const diasCreacion = Math.floor((hoy.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));

  let clase = '';

  if (diasCompromiso > 3) {
    clase = 'fila-verde';
  } else if (diasCompromiso < -3) {
    clase = 'fila-rojo';
  } else if (diasCompromiso >= -3 && diasCompromiso <= 3) {
    clase = 'fila-amarillo';
  } else if (diasCreacion <= 4) {
    clase = 'fila-verde';
  } else if (diasCreacion >= 7) {
    clase = 'fila-rojo';
  } else {
    clase = 'fila-amarillo';
  }

  //console.log('Row:', row, 'Clase:', clase, 'DiffComp:', diasCompromiso, 'DiffCre:', diasCreacion);
  return clase;
}

getColorClaseProduccion(row: any): string {
  const hoy = new Date();

  const fechaAsignacion = new Date(row.Fecha_AsignaAnalista);
  const fechaPCP = new Date(row.fec_Teorico_Inicio_Tenido);

  // Diferencia en días con PCP
  const diasPCP = Math.floor((fechaPCP.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  // Diferencia en días desde asignación
  const diasAsignacion = Math.floor((hoy.getTime() - fechaAsignacion.getTime()) / (1000 * 60 * 60 * 24));

  // --- PRIORIDAD: Fecha PCP ---
  if (diasPCP <= 3) {
    return 'fila-rojo'; // faltan 3 días o menos
  } else if (diasPCP > 3) {
    return 'fila-verde'; // faltan más de 3 días
  }

  // --- Si no aplica PCP, usamos fecha de asignación ---
  if (diasAsignacion <= 5) {
    return 'fila-verde';   // asignado hace ≤ 5 días
  } else if (diasAsignacion >= 6) {
    return 'fila-rojo';    // asignado hace ≥ 6 días
  } else {
    return 'fila-amarillo'; // intervalo intermedio
  }
}




  onCreate(objeto: any) {

    let num_sdc = objeto.corr_Carta;

    let dialogref = this.dialog.open(DialogLabColTrabajoDetalleComponent, {
      panelClass: 'dialog-tablet',
      width: '900px',
      height: '400px',
      maxWidth: 'none',
      disableClose: false,
      data: {
        Title: "Detalle",
        Num_SDC: num_sdc
      }
    });
    dialogref.afterClosed().subscribe(result => { this.onGetListaSDC() }
    );
  }

  aplicarFiltrarTodo(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.estadoSeleccionadoChild === '05') {
      this.dataSourceProduccion.filter = filterValue;
    } else {
      this.dataSource.filter = filterValue;
    }

  }

  filtrarTodo(): void {

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {

      const estadoOk = !this.estadoSeleccionado || data.estado === this.estadoSeleccionado;

      let fechaOk = true;

      if (this.range.value.start && this.range.value.end) {
        const fecha = new Date(data.fec_creacion);
        fechaOk = fecha >= this.range.value.start && fecha <= this.range.value.end;
      }

      const texto = filter.toLowerCase();

      const textoOk = Object.values(data).some(val =>
        val?.toString().toLowerCase().includes(texto)
      );

      return estadoOk && fechaOk && textoOk;
    };

  }

  dataTenido: any = {}
  EncolarHojaFormulacionProduccion(): void {
    this.dataTenido = {
      ...this.dataTenido,
      "Usr_Cod": this.Usuario
    };
    console.log(this.dataTenido);
    if (this.dataTenido.Cur_Ten == 0 || this.dataTenido.Cur_Ten == '') { this.toastr.warning('Debe seleccionar una curva', 'Atención'); return; }
    this.SpinnerService.show();
    this.LabColaTrabajoService.postRegistrarDetalleColorSDC(this.dataTenido).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.codeResult == 200) {
            this.toastr.success(response.message, '', {
              timeOut: 2500,
            });
          } else if (response.codeResult == 201) {
            this.toastr.info(response.message, '', {
              timeOut: 2500,
            });
          }
          this.getObtenerDatosProduccion();
          this.SpinnerService.hide();
          this.dialogRef1.close();
        } else {
          this.toastr.error(response.message, 'Cerrar', {
            timeOut: 2500
          });
          this.SpinnerService.hide();
        }
      },
      error: (error) => {
        this.SpinnerService.hide();
        this.toastr.error(error.message, 'Cerrar', {
          timeOut: 2500
        });
      }
    })
  }

  itemsProduccion = []
  getLlenarDesplegableProduccion(Usr_Cod: string): void {
    this.LabColaTrabajoService.getLlenarDesplegableProduccion(Usr_Cod).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.itemsProduccion = response.elements;
          }
        }
      },
      error: (error: any) => {

      }
    });
  }

  getListarCurvas(Pro_Cod: string): void {
    this.LabColaTrabajoService.getListarCurvas(Pro_Cod).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.curvas = response.elements.map((c: any) => ({
            codigo: c.codigo,
            descripcion: c.descripcion
          }));
        }
      },
      error: (error: any) => {
        console.log(error.error.message, 'Cancelar', { timeout: 3000 });
      }
    });
  }

  onSeleccionarCurva(codigoSeleccionado: string): void {
    this.curvaSeleccionada = codigoSeleccionado;
    this.onCargarCurvaDes(codigoSeleccionado);
  }

  onCargarCurvaDes(codigo: string): void {
    this.LabColaTrabajoService.getListarCurvas(codigo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.curvasDescripcion = response.elements.map((c: any) => ({
            codigo: c.codigo,
            descripcion: c.descripcion,
            tipo: c.tipo
          }));
        }
      },
      error: (error: any) => {
        console.log(error.error.message, 'Cancelar', { timeout: 3000 });
      }
    });
  }

  onSeleccionarCurvaDescripcion(codigoSeleccionado: string): void {
    //OBTENER EL NOMBRE DE LA CURVA
    const curva = this.curvas.find(c => c.codigo === codigoSeleccionado);

    this.curvaSeleccionadaDes = curva ? curva.descripcion : '';

    console.log(this.curvaSeleccionadaDes);

    this.dataTenido = {
      ...this.dataTenido,
      "Cur_Ten": parseInt(codigoSeleccionado),
      "Usr_Cod": GlobalVariable.vusu
    }

  }


  // onEnviarAHojaFormulacion() {
  //   this.dataTenido = {
  //     ...this.dataTenido,
  //     "Usr_Cod": this.Usuario
  //   };
  //   console.log(this.dataTenido);
  //   if (this.dataTenido.Cur_Ten == 0 || this.dataTenido.Cur_Ten == '') { this.toastr.warning('Debe seleccionar una curva', 'Atención'); return; }
  //   this.SpinnerService.show();
  //   this.LabColaTrabajoService.postRegistrarDetalleColorSDC(this.dataTenido).subscribe({
  //     next: (response: any) => {
  //       if (response.success) {
  //         if (response.codeResult == 200) {

  //           this.toastr.success(response.message, '', {
  //             timeOut: 2500,
  //           });
  //         } else if (response.codeResult == 201) {
  //           this.toastr.info(response.message, '', {
  //             timeOut: 2500,
  //           });
  //         }
  //         this.SpinnerService.hide();
  //         this.getObtenerDatosProduccion();
  //         this.dialogRef1.close();
  //       } else {
  //         this.toastr.error(response.message, 'Cerrar', {
  //           timeOut: 2500
  //         });
  //         this.SpinnerService.hide();
  //       }
  //     },
  //     error: (error: any) => {
  //       this.SpinnerService.hide();
  //       this.toastr.error(error.message, 'Cerrar', {
  //         timeOut: 2500
  //       });
  //     }

  //   })

  // }

  onEnviarAHojaFormulacion() {
    const ProcesoSeleccionado = this.curvaSeleccionada;
    console.log(':::::..', ProcesoSeleccionado);
    this.dataTenido = {
      ...this.dataTenido,
      "Usr_Cod": this.Usuario,
      Familia: ProcesoSeleccionado
    };
    //console.log(this.dataTenido);
      // Validar que haya al menos una curva seleccionada
      if(this.dataTenido.Cur_Ten_Dis === '0'){
        if (!this.curvasSeleccionadasDes || this.curvasSeleccionadasDes.length === 0) {
          this.toastr.warning('Debe seleccionar una curva', 'Atención');
          return;
        }

        // Si hay una sola curva, la asignamos a Cur_Ten
        if (this.curvasSeleccionadasDes.length === 1) {
          this.toastr.warning('Debe seleccionar 2 curvas');
          return;
        }

        // Si hay dos curvas, disgregamos en Cur_Ten y Cur_Ten_Dis
        if (this.curvasSeleccionadasDes.length === 2) {
          // Ordenar ascendente por código antes de asignar
          const ordenadas = [...this.curvasSeleccionadasDes].sort(
            (a, b) => parseInt(a.codigo) - parseInt(b.codigo)
          );

          this.dataTenido.Cur_Ten = parseInt(ordenadas[0].codigo);
          this.dataTenido.Cur_Ten_Dis = parseInt(ordenadas[1].codigo);
        }
      }

    console.log('DataTenido listo para enviar:', this.dataTenido);

    this.SpinnerService.show();
    this.LabColaTrabajoService.postRegistrarDetalleColorSDC(this.dataTenido).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.codeResult == 200) {
            this.onGetListaSDC();
            this.toastr.success(response.message, '', { timeOut: 2500 });
          } else if (response.codeResult == 201) {
            this.toastr.info(response.message, '', { timeOut: 2500 });
          }
          this.SpinnerService.hide();
          this.dialogRef1.close();
        } else {
          this.toastr.error(response.message, 'Cerrar', { timeOut: 2500 });
          this.SpinnerService.hide();
        }
      },
      error: (error) => {
        this.SpinnerService.hide();
        this.toastr.error(error.message, 'Cerrar', { timeOut: 2500 });
      }
    });
  }

  CargarModalTenido(data_cola_trab_produccion: any): void {
    //let Cod_OrdTra = this.dataListadoProduccion[0].cod_OrdTra;
    let Cod_OrdTra = data_cola_trab_produccion.cod_OrdTra;
    this.dataTenido = {
      "Corr_Carta": '',
      "Cod_OrdTra": Cod_OrdTra,
      "Sec": 1,
    };

    this.getListarCurvas('0.00000')
    this.curvaSeleccionada = '';

    setTimeout(() => { this.dialogRef1 = this.dialog.open(this.modalEnviar, { width: '500px' }); }, 300);
  }

  ReformularPartida(data_cola_trab_produccion: any): void {
    let Flg_Est_Lab = data_cola_trab_produccion.flg_Est_Lab;
    let Cod_OrdTra = data_cola_trab_produccion.cod_OrdTra;

    if (Flg_Est_Lab !== '02') {
      this.toastr.warning('NO SE PUEDE REFORMULAR UNA PARTIDA QUE NO HA SIDO ENTREGADA', 'ALERTA', {
        timeOut: 2500
      });
      return;
    }

    const data = {
      'Corr_Carta': Cod_OrdTra,
      'Sec': 1
    }

    this.patchReformularPartida(data);

    // this.ActualizarEstado('¿REFORMULAR PARTIDA?', Cod_OrdTra, 1, '04');
  }

  patchReformularPartida(data: any): void {
    this.LabColaTrabajoService.patchReformularPartida(data).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message, 'Éxito', {
          timeOut: 2500
        });
      },
      error: (error: any) => {

      }
    });
  }

  ActualizarEstado(titulo: string, corr_carta: any, sec: number, flg_est_lab: string) {
    Swal.fire({
      title: titulo,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        const sCorr_Carta = corr_carta;
        const sSec = sec;
        const sFlg_Est_Lab = flg_est_lab;
        let data: any = {
          "Corr_Carta": sCorr_Carta,
          "Sec": sSec,
          "Flg_Est_Lab": sFlg_Est_Lab
        };
        this.SpinnerService.show();
        this.LabColaTrabajoService.patchActualizarEstadoDeColor(data).subscribe({
          next: (response: any) => {
            if (response.success) {
              if (response.codeResult == 200) {
                this.toastr.success(response.message, 'Cerrar', {
                  timeOut: 2500
                });
              }
              this.SpinnerService.hide();
            } else {
              this.toastr.error(response.message, 'Cerrar', {
                timeOut: 2500
              });
              this.SpinnerService.hide();
            }
          },
          error: (error) => {
            this.SpinnerService.hide();
            this.toastr.error(error.message, 'Cerrar', {
              timeOut: 2500
            });
          }
        })
      }
    })
  }

  onSeleccionarCurvas(event: any): void {
    const seleccionadas = event.value as any[];
    if (!seleccionadas) return;

    console.log('Curvas seleccionadas:', seleccionadas);

    // Validar máximo 2
    if (seleccionadas.length > 2) {
      this.toastr.warning('Solo puedes seleccionar máximo 2 curvas');
      seleccionadas.splice(2);
    }

    // Validar que sean de tipo distinto SOLO si ya hay 2
    if (seleccionadas.length === 2) {
      const tipos = seleccionadas.map(c => c.tipo);
      const tieneR = tipos.includes('R');
      const tieneD = tipos.includes('D');

      if (!(tieneR && tieneD)) {
        this.toastr.warning('Debes seleccionar una curva tipo R y otra tipo D');
        this.curvasSeleccionadasDes = [];
        return;
      }
    }

    // Ordenar siempre por código ascendente
    seleccionadas.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));

    this.curvasSeleccionadasDes = seleccionadas;
    this.curvaSeleccionadaDes = '';

    // Solo actualizamos dataTenido si ya hay 2 válidas
    if (this.curvasSeleccionadasDes.length === 2) {
      this.dataTenido = {
        ...this.dataTenido,
        Cur_Ten: parseInt(this.curvasSeleccionadasDes[0].codigo),
        Cur_Ten_Dis: parseInt(this.curvasSeleccionadasDes[1].codigo),
        Usr_Cod: this.Usuario
      };
      console.log('DataTenido actualizado:', this.dataTenido);
    }
  }

  /*******************************************PRODUCCION*************************************************/

}
