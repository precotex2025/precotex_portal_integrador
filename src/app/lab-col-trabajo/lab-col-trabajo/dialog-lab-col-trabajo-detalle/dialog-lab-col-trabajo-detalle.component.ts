import { Component, Inject, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { LabColTrabajoService } from '../../../services/lab-col-trabajo/lab-col-trabajo.service';
import Swal from 'sweetalert2';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GlobalVariable } from '../../../VarGlobals';
import { AuthService } from '../../../authentication/auth.service';
import { Router } from '@angular/router';

interface data_color {
  corr_Carta: any,
  sec: string,
  descripcion_Color: string,
  cod_Color: string,
  dias_Lab: number,
  estandar_Tono_Comer: string,
  formulado: string,
  Flg_Est_Lab: string
}

interface data {
  Num_SDC: any
}

@Component({
  selector: 'app-dialog-lab-col-trabajo-detalle',
  templateUrl: './dialog-lab-col-trabajo-detalle.component.html',
  styleUrl: './dialog-lab-col-trabajo-detalle.component.scss'
})
export class DialogLabColTrabajoDetalleComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('modalEnviar') modalEnviar!: TemplateRef<any>;
  dialogRef1!: MatDialogRef<any>;
  Usuario: string = '';
  constructor(
    private SpinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: data,
    private LabColTrabajoService: LabColTrabajoService,
    public dialogRef: MatDialogRef<DialogLabColTrabajoDetalleComponent>,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) { }
  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      //console.log('Usuario activo: -------', this.authService.getUsuario());
      this.Usuario = this.authService.getUsuario()!;
    } else {
      this.router.navigate(['/login']);
    }

    this.onGetDetalle();
    this.getListarCurvas('0.00000');
    this.dataTenido.Cur_Ten = 0;
  }

  displayedColumns: string[] = [
    'HojaFormulacion',
    'corr_Carta',
    'num_sec',
    'color',
    'fec_Asignacion',
    'fec_Entrega',
    'dias_Lab',
    'est_ton_com',
    'formulado',
  ];

  dataSource: MatTableDataSource<data_color> = new MatTableDataSource();
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataListadoDetalle: Array<any> = [];
  descripcion: string = '';
  curvas: { codigo: string, descripcion: string }[] = [];
  curvaSeleccionada: string = '';
  curvasDescripcion: { codigo: string, descripcion: string, tipo: string }[] = [];
  curvaSeleccionadaDes: string = '';


  pintarEnvio(row: any): string {
    const est_lab = row.flg_Est_Lab;
    if (est_lab === '02') {
      return 'Color-Amarillo'
    } else if (est_lab === '03') {
      return 'Color-Verde'
    } else if (est_lab === '04') {
      return 'Color-Verde'
    } else if (est_lab === '05') {
      return 'Color-Verde'
    } else if (est_lab === '06') {
      return 'Color-Verde'
    } else if (est_lab === '07') {
      return 'Color-Verde'
    } else if (est_lab === '09') {
      return 'Color-Verde'
    }
    else {
      return 'Color-Negro';
    }
  }

  onGetDetalle() {
    let Corr_Carta = this.data.Num_SDC;
    this.SpinnerService.show();
    this.dataListadoDetalle = [];
    this.LabColTrabajoService.getListaSDCDetalle(Corr_Carta).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.dataListadoDetalle = response.elements;
            //console.log(this.dataListadoDetalle);
            this.dataSource.data = this.dataListadoDetalle;
            this.dataSource.sort = this.sort;
            this.SpinnerService.hide();
          } else {
            this.SpinnerService.hide();
          };
        }
      },
      error: (error) => {
        this.SpinnerService.hide();
      }
    })
  }
  dataTenido: any = {}
  CargarModalTenido(data_cola_trab: any): void {
    let Corr_Carta = this.dataListadoDetalle[0].corr_Carta;
    let Sec = data_cola_trab.sec;
    let sFormulado = data_cola_trab.formulado;
    const sCorr_Carta = Corr_Carta;
    const sSec = Sec;

    this.dataTenido = {
      "Corr_Carta": sCorr_Carta,
      "Sec": sSec,
      "Cur_Ten": 0,
    };

    this.curvasSeleccionadasDes = [];
    this.getListarCurvas('0.00000')
    this.curvaSeleccionada = '';
    // this.dialogRef1 = this.dialog.open(this.modalEnviar, { 
    //   width: '500px', 
    //   }); 

    setTimeout(() => { this.dialogRef1 = this.dialog.open(this.modalEnviar, { width: '500px' }); }, 300);

  }

  // onEnviarAHojaFormulacion() {
  //   this.dataTenido = {
  //     ...this.dataTenido,
  //     "Usr_Cod": this.Usuario
  //   };
  //   console.log(this.dataTenido);
  //   if (this.dataTenido.Cur_Ten == 0 || this.dataTenido.Cur_Ten == '') { this.toastr.warning('Debe seleccionar una curva', 'Atención'); return; }
  //   this.SpinnerService.show();
  //   this.LabColTrabajoService.postRegistrarDetalleColorSDC(this.dataTenido).subscribe({
  //     next: (response: any) => {
  //       if (response.success) {
  //         if (response.codeResult == 200) {
  //           this.onGetDetalle();
  //           this.toastr.success(response.message, '', {
  //             timeOut: 2500,
  //           });
  //         } else if (response.codeResult == 201) {
  //           this.toastr.info(response.message, '', {
  //             timeOut: 2500,
  //           });
  //         }
  //         this.SpinnerService.hide();
  //         this.dialogRef1.close();
  //       } else {
  //         this.toastr.error(response.message, 'Cerrar', {
  //           timeOut: 2500
  //         });
  //         this.SpinnerService.hide();
  //       }
  //     },
  //     error: (error) => {
  //       this.SpinnerService.hide();
  //       this.toastr.error(error.message, 'Cerrar', {
  //         timeOut: 2500
  //       });
  //     }

  //   })

  // }

  onEnviarAHojaFormulacion() {
    const ProcesoSeleccionado = this.curvaSeleccionada;
    this.dataTenido = {
      ...this.dataTenido,
      "Usr_Cod": this.Usuario,
      Familia: ProcesoSeleccionado
    };
    //console.log(this.curvaSeleccionadaDes);
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

    //console.log('DataTenido listo para enviar:', this.dataTenido);

    this.SpinnerService.show();
    this.LabColTrabajoService.postRegistrarDetalleColorSDC(this.dataTenido).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.codeResult == 200) {
            this.onGetDetalle();
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


  getListarCurvas(Pro_Cod: string): void {
    this.LabColTrabajoService.getListarCurvas(Pro_Cod).subscribe({
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
    //this.getListarCurvas('0.00000');
    this.onCargarCurvaDes(codigoSeleccionado);
  }

  onCargarCurvaDes(codigo: string): void {
    this.LabColTrabajoService.getListarCurvas(codigo).subscribe({
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
    this.curvasSeleccionadasDes = [];
    //console.log(this.curvaSeleccionadaDes);

    this.dataTenido = {
      ...this.dataTenido,
      "Cur_Ten": parseInt(codigoSeleccionado),
      Cur_Ten_Dis: 0,
      "Usr_Cod": GlobalVariable.vusu
    }

    console.log('LA INFORMACION AQUI ES -------------- ', this.dataTenido);
  }

  // ahora es un arreglo
  curvasSeleccionadasDes: any[] = [];

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







  ActualizarEstado(corr_carta: any, sec: number, flg_est_lab: string) {
    let Corr_Carta = 0
    let Sec = 0
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
        if (response.success) {
          if (response.codeResult == 200) {
            this.toastr.success(response.message, '', {
              timeOut: 2500,
            });
            this.dialogRef.close();
            this.router.navigate(['/HojaFormulacion'], {
              queryParams: {
                corr_CartaE: sCorr_Carta,
                secE: sSec
              }
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



}
