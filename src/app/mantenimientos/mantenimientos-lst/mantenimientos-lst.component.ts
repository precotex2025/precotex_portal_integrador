import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalVariable } from '../../VarGlobals';
import Swal from 'sweetalert2';
import { data } from 'jquery';
import { response } from 'express';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mantenimientos-lst',
  templateUrl: './mantenimientos-lst.component.html',
  styleUrl: './mantenimientos-lst.component.scss'
})

export class MantenimientosLstComponent implements OnInit {
  tipoSeleccionado: string = '01';
  columnas: string[] = ['item', 'descripcion', 'usuario', 'acciones', 'detalle'];
  columnasComponentesExtra: string[] = ['pro_Cod', 'pro_Des', 'acciones', 'detalle'];
  dataSource = new MatTableDataSource<any>();
  dataSourceComponentesExtra = new MatTableDataSource<any>();
  @ViewChild('modalNuevo') modalNuevo!: TemplateRef<any>;
  @ViewChild('modalProceso') modalProceso!: TemplateRef<any>;
  descripcionNueva: string = '';
  dialogRef: any;
  itemSeleccionado: number | null = null;
  Accion: string = '';
  codigoProceso: string = '';
  descripcionProceso: string = '';

  constructor(
    private labColTrabajoService: LabColTrabajoService,
    private dialog: MatDialog,
    private router: Router
  ){ }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log('usuario', GlobalVariable.vusu);
    this.dataSource.data = [];
    console.log('Tipo seleccionado:', this.tipoSeleccionado);
    if(this.tipoSeleccionado == '01'){
      this.getListarJabonadoMantenimiento();
    } else if(this.tipoSeleccionado == '02'){
      this.getListarFijadosMantenimiento();
    }else{
      this.getListarFamiliasProceso();
    }
  }

  onTipoChange(): void {
    this.cargarDatos();
  }


  getListarJabonadoMantenimiento(): void {
    this.labColTrabajoService.getListarJabonadoMantenimiento().subscribe({
      next: (response: any) => {
        if(response.success){
          this.dataSource.data = response.elements.map((item: any, index: number) =>({
            item: item.item,
            descripcion: item.descripcion,
            usuario: item.usuario
          }));
        }else{
          this.dataSource.data = [];
        }
      },
      error: (error: any) => {
        console.error('Error al obtener los datos de jabonado:', error);
        this.dataSource.data = [];
      }
    })
  }

  getListarFijadosMantenimiento(): void {
    this.labColTrabajoService.getListarFijadosMantenimiento().subscribe({
      next: (response: any) => {
        if(response.success){
          this.dataSource.data = response.elements.map((item: any, index: number) =>({
            item: item.item,
            descripcion: item.descripcion,
            usuario: item.usuario
          }));
        }else{
          this.dataSource.data = [];
        }
      },
      error: (error: any) => {
        console.error('Error al obtener los datos de fijado:', error);
        this.dataSource.data = [];
      }
    })
  }

  verDetalle(row: any): void {
    console.log('Ver detalle:', row);
    let tipo = this.tipoSeleccionado;
    let item = row.item;
    let descripcion = row.descripcion;

    console.log( this.tipoSeleccionado,item);
    this.router.navigate(['DetalleJabFij'], 
      { queryParams: {
          tipoE: tipo,
          itemE: item,
          descripcionE: descripcion
      }}
    )

  }
/////////////////////////////////////////////////

onNuevo(): void {
  if(this.tipoSeleccionado == '01' || this.tipoSeleccionado == '02'){
    this.Accion = 'I';
    this.descripcionNueva = '';
    this.dialogRef = this.dialog.open(this.modalNuevo, {
      width: '600px'
    });
  }else{
    this.onNuevoProceso();
  }
}

onEditar(row: any): void {
  this.Accion = 'U';
  this.itemSeleccionado = row.item;
  this.descripcionNueva = row.descripcion;
  this.dialogRef = this.dialog.open(this.modalNuevo, {
    width: '600px'
  });
}

onEliminar(row: any): void {
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
        if(this.tipoSeleccionado == '01'){

          const data = {
            jab_Id: row.item,
            flg_Status: 'I'
          }; 
          this.labColTrabajoService.patchDeshabilitarJabonado(data).subscribe({
            next: (response: any) => {
              this.cargarDatos();
            }
          });

        }else if(this.tipoSeleccionado == '02'){

          console.log('El tipo seleccionado es: ', this.tipoSeleccionado);
          console.log('Eliminar fijado:', row.item);
          const data = {
            fij_Id: row.item,
            flg_Status: 'I'
          };
          this.labColTrabajoService.patchDeshabilitarFijado(data).subscribe({
            next: (response: any) => {
              this.cargarDatos();
            }
          });

        }else {

          const data = {
            pro_Cod: row.pro_Cod
          }

          this.labColTrabajoService.patchDeshabilitarProceso(data).subscribe({
            next:(response: any) => {
              this.cargarDatos();
            }
          });

        }
      }
    })
}

onGrabar(): void {
  if (!this.descripcionNueva.trim()) return;

  if(this.Accion == 'I'){
    if(this.tipoSeleccionado == '01'){
      const data = { 
      jab_Des: this.descripcionNueva, 
      usr_Reg: GlobalVariable.vusu.toUpperCase()
    };
      this.postRegistrarJabonado(data);
    }else if(this.tipoSeleccionado == '02'){
      const data = { 
      fij_Des: this.descripcionNueva, 
      usr_Reg: GlobalVariable.vusu.toUpperCase()
    };
      this.postRegistrarFijado(data);
    }
  }else if(this.Accion == 'U'){
    if(this.tipoSeleccionado == '01'){
      const data = { 
      jab_Item: this.itemSeleccionado,
      jab_Des: this.descripcionNueva, 
      usr_Reg: GlobalVariable.vusu.toUpperCase()
    };
      this.patchModificarJabonado(data);
    }else if(this.tipoSeleccionado == '02'){
      const data = { 
      fij_Item: this.itemSeleccionado,
      fij_Des: this.descripcionNueva, 
      usr_Reg: GlobalVariable.vusu.toUpperCase()
    };
      this.patchModificarFijado(data);
    }
  }
  
}

postRegistrarJabonado(data: any): void {
  this.labColTrabajoService.postRegistrarJabonado(data).subscribe({
    next: () => {
      this.dialogRef.close();
    },
    error: () => {
      console.error('Error al grabar');
    }
  });
}

postRegistrarFijado(data: any): void {
  this.labColTrabajoService.postRegistrarFijado(data).subscribe({
    next: () => {
      this.dialogRef.close();
    },
    error: () => {
      console.error('Error al grabar');
    }
  });
}

patchModificarJabonado(data: any): void{
  this.labColTrabajoService.patchModificarJabonado(data).subscribe({
    next: (response: any) => {
        this.dialogRef.close();
    },
    error: () =>{
      console.error('Error al modificar');
    }
  })
}

patchModificarFijado(data: any): void{
  this.labColTrabajoService.patchModificarFijado(data).subscribe({
    next: (response: any) => {
        this.dialogRef.close();
    },
    error: (error: any) =>{
      console.error('Error al modificar');
    }
  })
}



/************************PROCESOS********************************/
getListarFamiliasProceso(): void {
  this.labColTrabajoService.getListarFamiliasProceso().subscribe({
    next: (response: any) => {
      if(response.success){
        console.log('los elementos son: ', response.elements);
        this.dataSourceComponentesExtra.data = response.elements;

      }else{
        this.dataSourceComponentesExtra.data = [];
      }
    },
    error: (error:any) => {
      console.log(error.error.message, 'Cancelar', { timeout: 3000 });
    }
  });
}

onNuevoProceso(): void {
  this.Accion = 'I';
  this.codigoProceso = '';
  this.descripcionProceso = '';
  this.dialogRef = this.dialog.open(this.modalProceso, {
    width: '400px',
    disableClose: true
  });
}

onEditarProceso(row: any): void {
  this.Accion = 'U';
  this.codigoProceso = row.pro_Cod;
  this.descripcionProceso = row.pro_Des;
  this.dialogRef = this.dialog.open(this.modalProceso, {
    width: '400px',
    disableClose: true
  });
}

onVerDetalleProceso(row: any): void {
  let Pro_Cod: string = row.pro_Cod;
  this.router.navigate(['/DetalleCompExtra'], {
    queryParams: {
      Pro_CodE: Pro_Cod
    }
  });
}

guardarProceso(): void {
  const data = {
    pro_Cod: this.codigoProceso.trim(),
    pro_Des: this.descripcionProceso.trim()
  };
  console.log('los datos del proceso para grabar son: ', data);
  if (!data.pro_Cod || !data.pro_Des) return;

  if (this.Accion === 'I') {
    this.labColTrabajoService.postRegistrarProceso(data).subscribe({
      next: (response: any) =>{

      },
      error: (error: any) => {
        console.log(error.error.message, 'Cancelar', { timeout: 3000 });
      }
    });
    console.log('Insertar proceso:', data);
  } else {
    this.labColTrabajoService.patchModificarProceso(data).subscribe({
      next: (response: any) => {

      },
      error: (error: any) => {
        console.log(error.error.message, 'Cancelar', { timeout: 3000 });
      }
    });
    console.log('Actualizar proceso:', data);
  }

  this.dialogRef.close();
}

onCancelar(): void {
  this.router.navigate(['ColaTrabajo']);
}

}
