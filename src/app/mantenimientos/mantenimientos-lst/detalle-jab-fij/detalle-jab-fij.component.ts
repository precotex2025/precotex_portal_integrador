import { Component, Input, OnInit, ViewChild, Optional, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { LabColTrabajoService } from '../../../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatSort } from '@angular/material/sort';
import { timeout } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalVariable } from '../../../VarGlobals';
import Swal from 'sweetalert2';


interface data {
  tipoR: string;
  itemR: number;
  descripcionR: string;
}


@Component({
  selector: 'app-detalle-jab-fij',
  templateUrl: './detalle-jab-fij.component.html',
  styleUrl: './detalle-jab-fij.component.scss'
})
export class DetalleJabFijComponent implements OnInit {
  @Input() codigoTabla: string = '01'; // '01' = jabonado, '02' = fijado
  @ViewChild('modalDetalle') modalDetalle!: TemplateRef<any>;

  columnasJabonado: string[] = ['item', 'rangoInicio', 'rangoFin', 'cantidad', 'proceso', 'acciones'];
  columnasFijado: string[] = ['item', 'rangoInicio', 'rangoFin', 'proceso', 'acciones'];

  dataSourceJabonado = new MatTableDataSource<any>();
  dataSourceFijado = new MatTableDataSource<any>();

  modoEdicion: boolean = false;
  
  titulo: string = '';
  dialogRef: any;
  rangoInicio: number = 0;
  rangoFin: number = 0;
  cantidad: number = 0;
  proceso: string = '';
  Accion: string = '';
  Id: number = 0;

  Jab_Ran_Ini_Org: number = 0;
  Fij_Ran_Ini_Org: number = 0;
  Familia_Org: string = '';

  @ViewChild(MatSort) sort!: MatSort;  
  constructor(
    private labColTrabajoService: LabColTrabajoService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private router: Router
  ){}

  ngOnInit(): void {
    this.cargarDatos();
  }

  
  cargarDatos(): void {
    let codigo: string;
    let item: number;
    this.route.queryParams.subscribe(params => {
      this.data = {
        tipoR: params['tipoE'] ?? '',
        itemR: params['itemE'] !== undefined ? Number(params['itemE']) : 0,
        descripcionR: params['descripcionE'] ?? '',
      };
    })
    this.titulo = this.data.descripcionR + ' - DETALLE';
    this.codigoTabla = this.data.tipoR;
    codigo = this.data.tipoR
    item = this.data.itemR;
    if (codigo === '01') {
      this.getListarJabonadosDetalleMantenimiento(item);
    } else if (codigo === '02') {
      this.getListarFijadosDetalleMantenimiento(item);
    }
  }

  getListarJabonadosDetalleMantenimiento(Jab_Id: number): void{
    this.labColTrabajoService.getListarJabonadosDetalleMantenimiento(Jab_Id).subscribe({
      next: (response: any) => {
        if(response.success){
          this.dataSourceJabonado.data = response.elements;
          this.dataSourceJabonado.sort = this.sort;
        }else{
          this.dataSourceJabonado.data = [];
        }
        
      },
      error: (error: any) => {
        console.log(error.error.message, 'Cerrar', { timeout: 3000});
      }
    });
  }

  getListarFijadosDetalleMantenimiento(Fij_Id: number): void{
    this.labColTrabajoService.getListarFijadosDetalleMantenimiento(Fij_Id).subscribe({
      next: (response: any) => {
        if(response.success){
          this.dataSourceFijado.data = response.elements;
          this.dataSourceFijado.sort = this.sort;
        }else{
          this.dataSourceFijado.data = [];
        }
        
      },
      error: (error: any) => {
        console.log(error.error.message, 'Cerrar', { timeout: 3000});
      }
    });
  }

  onNuevo(): void { 
    this.Accion = 'I';
    this.Id = 0;
    this.rangoInicio = 0; 
    this.rangoFin = 0; 
    this.cantidad = 0; 
    this.proceso = '';
    this.Jab_Ran_Ini_Org = 0,
    this.Fij_Ran_Ini_Org = 0,
    this.Familia_Org = '',
    this.dialogRef = this.dialog.open(this.modalDetalle, { 
      width: '500px', 
    }); 
  }

  onEditar(row: any): void {
    this.Accion = 'U';
    if(this.codigoTabla ==='01'){
      this.Id = row.jab_Id;
      this.rangoInicio = row.jab_Ran_Ini;
      this.Jab_Ran_Ini_Org = row.jab_Ran_Ini;
      this.rangoFin = row.jab_Ran_Fin;
      this.cantidad = row.jab_Can;
      this.proceso = row.familia;
      this.Familia_Org = row.familia;
    }else if(this.codigoTabla ==='02'){
      this.Id = row.fij_Id;
      this.rangoInicio = row.fij_Ran_Ini;
      this.Fij_Ran_Ini_Org = row.jab_Ran_Ini;
      this.rangoFin = row.fij_Ran_Fin;
      this.cantidad = 0;
      this.proceso = row.familia;
      this.Familia_Org = row.familia;
    }
    
    this.dialogRef = this.dialog.open(this.modalDetalle, {
      width: '500px',
    });
  }


  onEliminar(row:any): void {
    const data = {
          jab_Id: row.jab_Id,
          jab_Ran_Ini: row.jab_Ran_Ini,
          familia: row.familia,
          flg_Status: 'I'
        }
        console.log('los datos a eliminar son: ', data);
  Swal.fire({
    title: '¿Desea eliminar el registro?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor:'#3085d6',
    cancelButtonColor:'#d33',
    confirmButtonText:'Si',
    cancelButtonText: 'No'
    }).then((result) =>{
      if(result.isConfirmed){  
        if(this.codigoTabla == '01'){

        const data = {
          jab_Id: row.jab_Id,
          jab_Ran_Ini: row.jab_Ran_Ini,
          familia: row.familia,
          flg_Status: 'I'
        }

        this.labColTrabajoService.patchDeshabilitarJabonadoDetalle(data).subscribe({
          next: (response: any) => {

          }, error: (error: any) => {
            console.log(error.error.message, 'Cancelar', { timeout: 3000 });
          }
          
        });

        }else if(this.codigoTabla == '02'){
        
          const data = {
            fij_Id: row.fij_Id,
            fij_Ran_Ini: row.fij_Ran_Ini,
            familia: row.familia,
            flg_Status: 'I'
          }

          this.labColTrabajoService.patchDeshabilitarFijadoDetalle(data).subscribe({
            next: (response: any) => {

            }, error: (error: any) => {
              console.log(error.error.message, 'Cancelar', { timeout: 3000 });
            }
            
          });
        }    
      }
    })
  }
  
  guardarDetalle(): void {
    
    if(this.codigoTabla == '01'){

      const data = {

        jab_Id: this.Id,
        jab_Ran_Ini: this.rangoInicio,
        jab_Ran_Fin: this.rangoFin,
        jab_Can: this.cantidad,
        familia: this.proceso,
        usr_Reg: GlobalVariable.vusu,
        usr_Mod: GlobalVariable.vusu,
        jab_Ran_Ini_Org: this.Jab_Ran_Ini_Org,
        familia_Org: this.Familia_Org

      }

      if(this.Accion == 'I'){

        this.postRegistrarJabonadoDetalle(data);

      }else{

        this.patchModificarJabonadoDetalle(data);

      }
    }else if(this.codigoTabla == '02'){

      const data = {

        fij_Id: this.Id,
        fij_Ran_Ini: this.rangoInicio,
        fij_Ran_Fin: this.rangoFin,
        familia: this.proceso,
        usr_Reg: GlobalVariable.vusu,
        usr_Mod: GlobalVariable.vusu,
        fij_Ran_Ini_Org: this.Fij_Ran_Ini_Org,
        familia_Org: this.Familia_Org

      }

      if(this.Accion == 'I'){

        this.postRegistrarFijadoDetalle(data);

      }else{

        this.patchModificarJabonadoDetalle(data);

      }
    }

  }


  postRegistrarJabonadoDetalle(data: any): void {
    this.labColTrabajoService.postRegistrarJabonadoDetalle(data).subscribe({
      next: (response: any) => {

      },error: (error: any) => {
        console.log(error.error.message, 'Cerrar', { timeout: 3000});
      }
    });
  }

  postRegistrarFijadoDetalle(data: any): void {
    this.labColTrabajoService.postRegistrarFijadoDetalle(data).subscribe({
      next: (response: any) => {
      
      }, error: (error: any) => {
        console.log(error.error.message, 'Cerrar', { timeout: 3000});
      }      
    });
  }


  patchModificarJabonadoDetalle(data: any): void {
    this.labColTrabajoService.patchModificarJabonadoDetalle(data).subscribe({
      next:(response: any) => {

      }, error: (error: any) => {
        console.log(error.error.message, 'Cerrar', { timeout: 3000 });
      }
    });
  }

  patchDeshabilitarJabonadoDetalle(data: any): void{
    this.labColTrabajoService.patchDeshabilitarJabonadoDetalle(data).subscribe({
      next: (response: any) => {

      }, error: (error: any) => {
        console.log(error.error.message, 'Cancelar', { timeout: 3000 });
      }
    });
  }

  patchDeshabilitarFijadoDetalle(data: any): void{
    this.labColTrabajoService.patchDeshabilitarFijadoDetalle(data).subscribe({
      next: (response: any) => {

      }, error: (error: any) => {
        console.log(error.error.message, 'Cancelar', { timeout: 3000 });
      }
    });
  }

  onCerrar(): void {
    this.router.navigate(['Mantenimientos']);
  }

}

