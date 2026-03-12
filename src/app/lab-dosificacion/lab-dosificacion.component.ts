import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject, Optional } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from './dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { compileDeclareClassMetadata } from '@angular/compiler';
import { endWith } from 'rxjs';
import { getJSON } from 'jquery';
import { AuthService } from '../authentication/auth.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data
  ) { }

  dataSource: MatTableDataSource<data_dosificacion> = new MatTableDataSource();
  // registros: RegistroDosificacion[] = [];

  menuItems: { codigo: number, nombre: string, estado: string }[] = [];

  columnas: string[] = [];

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
    'corr_Carta',
    'nro_Tubo',
    'descripcion_Color',
    'jab_Des',
    'dosificacion1',
    'dosificacion2',
    'dosificacion3',
    'soda',
    'sec',
    'correlativo',
    'ph_Fin'
  ];

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
        Title: "PH Final",
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        Condicion: 2
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
          this.dataListadoDosificaciones = response.elements as any[];
          this.dataSource.data = this.dataListadoDosificaciones;
          this.dataSource.sort = this.sort;

          this.tituloCurva = this.dataListadoDosificaciones[0]?.cur_Des || '';
          this.SpinnerService.hide();
        } else {
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

  btnIniciarDisabled: boolean = false; 
  btnFinalizarDisabled: boolean = true;

  IniciarProceso(): void {
    const data = {
      ahi_Id: this.itemSeleccionado.codigo,
      ahi_Est_Pro: 'I'
    }

    this.LabColTrabajoService.patchProcesoAhiba(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.btnIniciarDisabled = true; 
          this.btnFinalizarDisabled = false;
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
        }
      },
      error: (error: any) => {
      }
    });
  }


}
