import { Component, OnInit, ViewChild } from '@angular/core';
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


import { NonNullableFormBuilder } from '@angular/forms';
interface data_colaautolab {
corr_Carta: number,
sec: number,
correlativo: number,
descripcion_Color: string,
jab_Des: string,
volumen: number
}

interface data_dispensado {
  corr_Carta: number,
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

    @ViewChild(MatSort) sort!: MatSort;   
    constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private toastr: ToastrService

    ){}

    ngOnInit(): void {
      this.ahibaSeleccionado = 1;
      this.onListarColaAutolab();
      // this.onListarDispensado();
    }

    estadoSeleccionado: 'cola' | 'dispensado' = 'cola';

    columnsToDisplay: string[] = [
    'seleccion',
    'corr_Carta',
    'sec',
    'correlativo',
    'descripcion_Color',
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
  onListarColaAutolab(){    
    
    this.SpinnerService.show();
    this.dataListadoColaAutolab = [];
    this.LabColTrabajoService.getListarColaAutolab().subscribe({
      next:(response: any) => {
        if(response.success){
          console.log('elementos en el listado de cola autolab: ', response.elements);
          this.dataListadoColaAutolab = response.elements.map((colita: any) => ({
            ...colita,
            seleccionado: false
          }));
          this.dataSource.data = this.dataListadoColaAutolab;
          this.dataSource.sort = this.sort;
          this.SpinnerService.hide();
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })
  }

  haySeleccionados(): boolean {
    return this.dataSource.data.some((row:any) => row.seleccionado);
  }

//   enviarADispensar(): void {
//   const seleccionados = this.dataSource.data.filter((row: any) => row.seleccionado);
//   Swal.fire({
//     title: '¿Enviar a Dispensar?',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonColor: '#3085d6',
//     cancelButtonColor: '#d33',
//     confirmButtonText: 'Sí',
//     cancelButtonText: 'No'
//   }).then((result: any) => {
//     if (result.isConfirmed) {
//       const EnviarLote = () => {
//       const promesasMeDiste = seleccionados.map((item, index) => {
//         const dataEnviar = {
//           corr_Carta: item.corr_Carta,
//           sec: item.sec,
//           correlativo: item.correlativo,
//           posicion: 0
//         };
//         console.log('DATA A ENVIAR A DISPENSADO:', dataEnviar);
//         return this.LabColTrabajoService.patchEnviarADispensado(dataEnviar).toPromise();
//       });

//       Promise.all(promesasMeDiste)
//         .then(respuestas => {
//           const exitosos = respuestas.filter((r: any) => r.success && r.codeResult === 200);
//           console.log(`Actualizados correctamente: ${exitosos.length}`);
//           if (this.estadoSeleccionado === 'cola') {
//             this.onListarColaAutolab();
//             setTimeout(EnviarLote, 3000);
//           }
//         })
//         .catch(error => {
//           console.error('Error en el envío a dispensado:', error);
//           setTimeout(EnviarLote, 3000);
//         });
//     };
//     EnviarLote();
//     }
//   });
// }

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

  try{
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
      corr_Carta: 0,
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
      this.onListarColaAutolab();
    }

  }finally{
    this.SpinnerService.hide();
  }
}




  cambiarEstado(valor: 'cola' | 'dispensado'): void {
    this.estadoSeleccionado = valor;
    if(this.estadoSeleccionado === 'cola'){
      this.onListarColaAutolab();
    }else if(this.estadoSeleccionado === 'dispensado'){
      this.onListarDispensado();
      this.listarAhibas();
    }
  }


  /*****************************************************/



  ahibaSeleccionado: number = 1;
  curvasAhiba: {codigo: number, nombre:string} [] = [];

  dataSourceDispensado : MatTableDataSource<data_dispensado> = new MatTableDataSource();

  columnsToDisplayDispensado: string[] = [
    'seleccionDispensado', 
    'corr_Carta',
    'sec', 
    'correlativo',
    'descripcion_Color', 
    'jab_Des', 
    'volumen', 
    'sal',
    'sulfato', 
    'pes_Mue', 
    'ph_Ini', 
    'detalle'
  ];


  dataListadoDispensado = [];
  onListarDispensado(){    
    this.SpinnerService.show();
    this.dataListadoDispensado = [];
    this.LabColTrabajoService.getListarDispensado().subscribe({
      next:(response: any) => {
        if(response.success){
          console.log('elementos en el listado de dispensado: ', response.elements);
          this.dataListadoDispensado = response.elements.map((dispensado: any) => ({
            ...dispensado,
            seleccionado: false
          }));
          this.dataSourceDispensado.data = this.dataListadoDispensado;
          this.dataSourceDispensado.sort = this.sort;
          this.SpinnerService.hide();
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })
  }

  toggleAll(checked: boolean): void {
    this.dataSourceDispensado.data.forEach((row: any) => row.seleccionado = checked);
  }

  isAllSelectedDispensado(): boolean {
    return this.dataSourceDispensado.data.every((row: any) => row.seleccionado);
  }

  isIndeterminateDispensado(): boolean {
    const selected = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);
    return selected.length > 0 && selected.length < this.dataSourceDispensado.data.length;
  }

  haySeleccionadosDispensados(): boolean {
    return this.dataSourceDispensado.data.some((row:any) => row.seleccionado);
  }
  
  // cargarAAHIBA(): void {
  //   const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);
  //   console.log('Cargar a AHIBA:', seleccionadas);

  //   Swal.fire({
  //       title: '¿Cargar a Ahiba?',
  //       icon: 'question',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#d33',
  //       confirmButtonText: 'Sí',
  //       cancelButtonText: 'No'
  //     }).then((result: any) => {
  //       if (result.isConfirmed) {
  //         const promesasMeDiste = seleccionadas.map(item => {
  //           console.log('ENTRA AL FOREACH');
  //           const dataEnviar = {
  //             corr_Carta: item.corr_Carta,
  //             sec: item.sec,
  //             ahi_Id: this.ahibaSeleccionado
  //           };
  //           return this.LabColTrabajoService.patchCargarAahiba(dataEnviar).toPromise();
  //         });

  //         Promise.all(promesasMeDiste)
  //           .then(respuestas => {
  //             const exitosos = respuestas.filter((r: any) => r.success && r.codeResult === 200);
  //             console.log(`Actualizados correctamente: ${exitosos.length}`);
  //             if (this.estadoSeleccionado === 'dispensado') {
  //               this.onListarDispensado();
  //             }
  //           })
  //           .catch(error => {
  //             console.error('Error en al cargar a ahiba:', error);
  //           });
  //       }
  //     });

  // }

async cargarAAHIBA(): Promise<void> {
  const seleccionadas = this.dataSourceDispensado.data.filter((row: any) => row.seleccionado);

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
    for (let i = 0; i < seleccionadas.length; i++) {
      const item = seleccionadas[i];
      const dataEnviar = {
        corr_Carta: item.corr_Carta,
        sec: item.sec,
        correlativo: item.correlativo,
        ahi_Id: this.ahibaSeleccionado
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
      this.onListarColaAutolab();
    }

  } finally {
    this.SpinnerService.hide();
  }
}



  //FALTA IMPLEMENTAR
  verReceta(row: any): void {
    let corre = row.correlativo;
    let corr_carta = row.corr_Carta;
    let sec1 = row.sec;

    let dialogref = this.dialog.open(DialogDetalleColorComponent,{
      width:'700px',
      //height: '700px',
      maxHeight: '700px',
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


  onCreate(): void{
      let num_sdc = 0;
  
      let dialogref = this.dialog.open(LabDosificacionComponent, {
        width:'1800px',
        height: '700px',
        autoFocus: false,
        disableClose: false,
        panelClass: 'my-class',
        data:{
          Title: "Detalle",
          Num_SDC: 0
        }
      });
  }

  ingresarPH(row: any): void{
      let num_sdc = row.corr_Carta;
      let sec = row.sec;
      let correlativo = row.correlativo;
      let dialogref = this.dialog.open(DialogAgregarPhComponent, {
        width:'500px',
        height: '300px',
        disableClose: false,
        panelClass: 'my-class',
        data:{
          Title: "PH Inicio",
          Corr_Carta: num_sdc,
          Sec: sec,
          Correlativo: correlativo,
          Condicion: 1
        }
      });

      dialogref.afterClosed().subscribe(result =>{
      this.onListarDispensado();
    });
  }
  
  listarAhibas(): void{
    this.SpinnerService.show();
    this.curvasAhiba = [];
    this.LabColTrabajoService.getListaAhibas().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            console.log('las ahibas son: ', response.elements);
            this.curvasAhiba = response.elements.map((c: any) => ({
              codigo: c.ahi_Id,
              nombre: c.ahi_Des
            }));
            this.SpinnerService.hide();
          }else{
            this.curvasAhiba = [];
            this.SpinnerService.hide();
          }
        }else{
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

  onSeleccionarAhiba(event: MatSelectChange): void {
    this.ahibaSeleccionado = event.value;
    console.log('Código seleccionado:', this.ahibaSeleccionado);
  }

}
