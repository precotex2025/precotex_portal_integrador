import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject, Optional } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from './dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { compileDeclareClassMetadata } from '@angular/compiler';
import { endWith } from 'rxjs';
import { getJSON } from 'jquery';
import { AuthService } from '../authentication/auth.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { response } from 'express';
import { ToastrService } from 'ngx-toastr';

interface data {
  Title: string;
  Num_SDC: any;
  Estado: string;
}

interface RegistroDosificacion {
  id_ensp: number;
  sec: number;
  color: string;
  curva: string;
  dosificaciones: number[]; 
  pm_final?: number;
}

interface data_dosificacion {
  corr_Carta: any,
  sec: number,
  correlativo: number,
  descripcion_Color: string,
  jab_Des: string,
  volumen: number,
  dosificacion1: number,
  dosificacion2: number,
  dosificacion3: number,
  ph_Fin: string,
  tip_Ten: string
}

@Component({
  selector: 'app-lab-dosificacion',
  templateUrl: './lab-dosificacion.component.html',
  styleUrl: './lab-dosificacion.component.scss'
})
export class LabDosificacionComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  dataSource: MatTableDataSource<data_dosificacion> = new MatTableDataSource();
  // registros: RegistroDosificacion[] = [];

  menuItems: { codigo: number, nombre: string, estado: string }[] = [];

  columnas: string[] = [];
  usandoPhColumns: boolean = false;
  TipoEnvio: string = '';

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
    } else {
      this.router.navigate(['/login']);
    }

    if(this.data.Estado === 'I'){
      console.log('hola');
    }else{
      console.log('adios');
    }

    this.listarAhibas();
    this.listarDosificacionesXAhiba(1);
  }

  columnsToDisplay: string[] = [
    // 'nro_Tubo',
    // 'dosificacion1',
    // 'dosificacion2',
    // 'dosificacion3',
    // 'soda',
    // 'ph_Fin',
    // 'reenvio',
    // 'corr_Carta',
    // 'descripcion_Color',
    // 'jab_Des',
    // 'sec',
    // 'correlativo'
  ];

  ingresarPHFinal(row: any): void {
    let num_sdc = row.corr_Carta;
    let sec = row.sec;
    let correlativo = row.correlativo;
    let tip_Ten = row.tip_Ten;

    if (tip_Ten === 'O') {
      this.toastr.warning('No se puede ingresar ph de un BLANCO');
      return;
    }

    let dialogref = this.dialog.open(DialogAgregarPhComponent, {
      width: '500px',
      height: '300px',
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: "PH Final",
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        Condicion: 2,
        Tip_Ten: tip_Ten
      }
    });

    dialogref.afterClosed().subscribe(result => {
      this.listarDosificacionesXAhiba(this.itemSeleccionado.codigo);
    });
  }

  ingresarPH(row: any, jabIndex: number): void {
    let num_sdc = row.corr_Carta;
    let sec = row.sec;
    let correlativo = row.correlativo;
    let tip_Ten = row.tip_Ten;

    if (tip_Ten === 'O') {
      this.toastr.warning('No se puede ingresar ph de un BLANCO');
      return;
    }

    let dialogref = this.dialog.open(DialogAgregarPhComponent, {
      width: '500px',
      height: '300px',
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: `PH Jabonado ${jabIndex}`,
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        JabonadoIndex: jabIndex,
        Condicion: 3,
        Tip_Ten: tip_Ten
      }
    });
    
    dialogref.afterClosed().subscribe(result => {
      this.listarDosificacionesXAhiba(this.itemSeleccionado.codigo);
    });
  }

  listarAhibas(): void {
    this.SpinnerService.show();
    this.menuItems = [];
    this.LabColTrabajoService.getListaAhibas().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.menuItems = response.elements
              .filter((c: any) => c.ahi_Id !== 0)
              .map((c: any) => ({
                codigo: c.ahi_Id,
                nombre: c.ahi_Des,
                estado: c.ahi_Est_Pro
              }));
          
            this.seleccionarAhiba(this.menuItems[0]);

            this.SpinnerService.hide();
          } else {
            this.menuItems = [];
            this.SpinnerService.hide();
          }
        } else {
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


    this.validarEstadoahibaPorCodigo(nroAhiba).then((estado: number) => {
      if (estado === 1) {
        this.btnIniciarDisabled = true;
        this.btnFinalizarDisabled = false;

      } else {
        this.btnIniciarDisabled = false;
        this.btnFinalizarDisabled = true;
      }
      this.itemSeleccionado = this.menuItems.find(m => m.codigo === nroAhiba);
    }).catch(err => console.error(err));
  }

curvasAhiba: { codigo: number, nombre: string, cantidadPosiciones: number, estado: string }[] = [];
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
              console.log('Ahiba encontrada:', ahibaEncontrada);
              if (ahibaEncontrada.estado === 'I') {
                resolve(1); 
              } else {
                resolve(0); 
              }
            } else {
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

  dataListadoDosificaciones: any[] = [];
  tituloCurva: string = '';

  listarDosificacionesXAhiba(Ahi_Id: number): void {
    this.SpinnerService.show();
    this.dataListadoDosificaciones = [];

    this.LabColTrabajoService.getListarItemsEnAhiba(Ahi_Id).subscribe({
      next: (response: any) => {
        if (response.success) {
          
          this.dataListadoDosificaciones = response.elements.map((item: any) => {
            const phArray = Array(item.can_Jabo).fill(null);
            if (item.ph_Jab && item.ph_Jab !== 0) phArray[0] = item.ph_Jab;
            if (item.ph_Jab2) phArray[1] = item.ph_Jab2;
            if (item.ph_Jab3) phArray[2] = item.ph_Jab3;
            return { ...item, ph_Jab: phArray };
          });

          const tieneTubos = this.dataListadoDosificaciones.some(
            item => item.nro_Tubo_Jab !== null && item.nro_Tubo_Jab !== 0
          );

          if (tieneTubos) {
            // this.columnsToDisplay = [
            //   'nro_Tubo',
            //   'jab_Des',
            //   ...this.getPhColumns(),
            //   'corr_Carta',
            //   'sec',
            //   'correlativo',
            //   'descripcion_Color'
            // ].slice();
            this.TipoEnvio = 'J';
            setTimeout(() => {
              this.columnsToDisplay = [
                'seleccion',
                'nro_Tubo',
                'jab_Des',
                ...this.getPhColumns(),
                'corr_Carta',
                'sec',
                'correlativo',
                'descripcion_Color'
              ];
              this.dataSource.data = this.dataListadoDosificaciones;
            }, 0);
            this.tituloCurva = 'Jabonados';
          } else {
            this.TipoEnvio = 'D';
            const curvas = [...new Set(this.dataListadoDosificaciones.map(item => item.cur_Des))];

            const curva11 = '11_AVITERA / SUNFIX / NOVACRON OCEANO S-R 60°C';
            const curva14 = '14_AVITERA/SUNFIX MEDIOS – OSCUROS - DIFICILES';
            const curva81 = '81_TURQUESAS 50°-80°C';
            const curva96 = '96_TURQUESAS 95°-80°C';

            if (curvas.length >= 2) {
              if (curvas.includes(curva11) && curvas.includes(curva14)) {
                this.tituloCurva = curva14;
              }
              else if (curvas.includes(curva81) && curvas.includes(curva96)) {
                this.tituloCurva = curva96;
              }
              else if (curvas.length === 3) {
                this.tituloCurva = curvas[0] || '';
              }
              else {
                this.tituloCurva = curvas[0] || '';
              }
            } else {
              this.tituloCurva = curvas[0] || '';
            }

            this.columnsToDisplay = [
              'nro_Tubo',
              'dosificacion1',
              'dosificacion2',
              'dosificacion3',
              'soda',
              'ph_Fin',
              'descargar',
              'reenvio',
              'corr_Carta',
              'descripcion_Color',
              'jab_Des',
              'sec',
              'correlativo'
            ].slice();
          }

          this.dataSource.data = this.dataListadoDosificaciones;
          this.dataSource.sort = this.sort;
          this.table.renderRows();
          this.SpinnerService.hide();
        } else {
          this.dataListadoDosificaciones = [];
          this.SpinnerService.hide();
        }
        if (this.dataListadoDosificaciones.length === 0) {
          // this.itemSeleccionado = Ahi_Id;
          this.patchActualizarEstadoCargaAhiba(Ahi_Id);
          this.SpinnerService.hide();
        }
      },
      error: (error: any) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', { timeout: 2500 });
      }
    });
  }




  btnIniciarDisabled: boolean = false; 
  btnFinalizarDisabled: boolean = true;

  IniciarProceso(): void {
    
    const data = {
      ahi_Id: this.itemSeleccionado.codigo,
      ahi_Est_Pro: 'I'
    }

    // if(this.tituloCurva === '29_BLQ QUIM 110x30' || this.tituloCurva === '30_BLQ QUIM 110x40' || this.tituloCurva === '31_BLQ QUIM 98x20'){
      
    // }

    this.LabColTrabajoService.patchProcesoAhiba(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.btnIniciarDisabled = true; 
          this.btnFinalizarDisabled = false;

          this.dataSource.data.forEach((row: any) => {
            const dataFechas = {
              corr_Carta: row.corr_Carta,
              sec: row.sec,
              correlativo: row.correlativo,
              tip_Fec: 'I',
              tip_Ten: row.tip_Ten
            }

            this.patchActualizarFechasTenido(dataFechas);
          });
        }
      },
      error: (error: any) => {
      }
    });

  }

  FinalizarProceso(): void {

    const data = {
      ahi_Id: this.itemSeleccionado.codigo,
      ahi_Est_Pro: 'F'
    }

    this.LabColTrabajoService.patchProcesoAhiba(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.btnIniciarDisabled = false; 
          this.btnFinalizarDisabled = true;

          this.dataSource.data.forEach((row: any) =>{
            const dataFechas = {
              corr_Carta: row.corr_Carta,
              sec: row.sec,
              correlativo: row.correlativo,
              tip_Fec: 'F',
              tip_Ten: row.tip_Ten
            }

            this.patchActualizarFechasTenido(dataFechas);
          });
        }
      },
      error: (error: any) => {
      }
    });

  }

  patchActualizarEstadoDeColorTricomia(row: any): void {
    let Corr_Carta: string = row.corr_Carta;
    let Sec: number = row.sec;
    let Correlativo: number = row.correlativo;
    let Flg_Est_Lab: string = '';
    let Tip_Ten: string = row.tip_Ten;

    if(this.TipoEnvio === 'D'){
      Flg_Est_Lab = '05';
    }else{
      Flg_Est_Lab = '10';
    }
    
    const data = {
      corr_Carta: Corr_Carta,
      sec: Sec,
      correlativo: Correlativo,
      flg_Est_Lab: '05',
      tip_Ten: Tip_Ten
    }

    console.log('::::::::::::::::.', data);

    this.LabColTrabajoService.patchActualizarEstadoDeColorTricomia(data).subscribe({
      next: (response: any) => {
        if(response.success){
          this.listarDosificacionesXAhiba(this.itemSeleccionado.codigo);
        }
      },
      error: (error: any) => {

      }
    });
  }

  patchActualizarFechasTenido(data: any): void{
    this.LabColTrabajoService.patchActualizarFechasTenido(data).subscribe({
      next: (response: any) => {

      },
      error: (error: any) => {

      }
    });
  }

  getPhColumns(): string[] {
    const max = Math.max(...this.dataSource.data.map((r: any) => r.can_Jabo || 1));
    return Array.from({ length: max }, (_, i) => 'ph_Jab' + (i + 1));
  }

  patchActualizarEstadoCargaAhiba(Ahi_Id: number){
    const data = {
      ahi_Id: Ahi_Id
    }
    console.log('::::::::::::::::::::::::::::::::.', data);
    this.LabColTrabajoService.patchActualizarEstadoCargaAhiba(data).subscribe({
      next: (response: any) => {

      },
      error: (error: any) => {}
    });
  }

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


  async Descargar(): Promise<void> {
      const seleccionados = this.dataSource.data.filter((row: any) => row.seleccionado);
  
      // const confirmacion = await Swal.fire({
      //   title: '¿Enviar a Dispensar?',
      //   icon: 'question',
      //   showCancelButton: true,
      //   confirmButtonColor: '#3085d6',
      //   cancelButtonColor: '#d33',
      //   confirmButtonText: 'Sí',
      //   cancelButtonText: 'No'
      // });
  
      // if (!confirmacion.isConfirmed) return;
  
      this.SpinnerService.show();
  
      try {
        for (let i = 0; i < seleccionados.length; i++) {
          const item = seleccionados[i];
          const dataEnviar = {
            corr_Carta: item.corr_Carta,
            sec: item.sec,
            correlativo: item.correlativo,
            flg_Est_Lab: '10', 
            tip_Ten: item.tip_Ten
          };

          console.log(':::::::::::::::::::::.', dataEnviar);
          try {
            const respuesta = await this.LabColTrabajoService.patchActualizarEstadoDeColorTricomia(dataEnviar).toPromise();
          } catch (error) {
            console.log('Error al actualizar el estado', error);
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } finally {
        this.SpinnerService.hide();
        this.listarDosificacionesXAhiba(this.itemSeleccionado.codigo);
      }
    }

    DescargarDosificacion(row: any): void {
      let Corr_Carta: string = '';
      let Sec: number = 0;
      let Correlativo: number = 0;
      let Flg_Est_Lab: string = '';
      let Tip_Ten: string = '';

      Corr_Carta = row.corr_Carta;
      Sec = row.sec;
      Correlativo = row.correlativo;
      Flg_Est_Lab = '11';
      Tip_Ten = row.tip_Ten;

      const data = {
        corr_Carta: Corr_Carta,
        sec: Sec,
        correlativo: Correlativo,
        flg_Est_Lab: Flg_Est_Lab,
        tip_Ten: Tip_Ten
      }

      this.LabColTrabajoService.patchActualizarEstadoDeColorTricomia(data).subscribe({
        next: (response: any) => {
          if(response.success){
            if(response.message === 'Solo se pueden descargar los BLANCOS de esta forma'){
              this.toastr.warning(response.message, '', {
                timeOut: 2500
              });
              // this.listarDosificacionesXAhiba(this.itemSeleccionado.codigo);
            }else if(response.message === 'No se ha completado su segundo tenido'){
              this.toastr.warning(response.message, '', {
                timeOut: 2500
              });
            }else{
              this.listarDosificacionesXAhiba(this.itemSeleccionado.codigo);
            }
          }
        },
        error:(error: any) => {}
      });
    }

}
