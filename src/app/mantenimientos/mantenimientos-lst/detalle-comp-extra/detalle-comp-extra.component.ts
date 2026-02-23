import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { LabColTrabajoService } from '../../../services/lab-col-trabajo/lab-col-trabajo.service';
import Swal from 'sweetalert2';


interface data {
  Pro_CodR: string
}

@Component({
  selector: 'app-detalle-comp-extra',
  templateUrl: './detalle-comp-extra.component.html',
  styleUrl: './detalle-comp-extra.component.scss'
})

export class DetalleCompExtraComponent implements OnInit {


  columnas: string[] = ['acciones', 'Pro_Cod', 'Com_Cod_Con', 'Com_Ran_Ini', 'Com_Ran_Fin', 
                        'Com_Cod_Extra1', 'Com_Can_Extra1', 'Com_Cod_Extra2', 'Com_Can_Extra2', 'Com_Cod_Extra3', 'Com_Can_Extra3',
                        'Com_Cod_Extra4', 'Com_Can_Extra4', 'Com_Cod_Extra5', 'Com_Can_Extra5', 'Com_Cod_Extra6', 'Com_Can_Extra6',
                        'Com_Cod_Extra7', 'Com_Can_Extra7', 'Com_Cod_Extra8', 'Com_Can_Extra8',
                        'Com_Cod_Extra9', 'Com_Can_Extra9', 'Com_Cod_Extra10', 'Com_Can_Extra10', 'Com_Cod_Extra11', 'Com_Can_Extra11',
                        'Com_Cod_Extra12', 'Com_Can_Extra12', 'Com_Cod_Extra13', 'Com_Can_Extra13', 'Com_Cod_Extra14', 'Com_Can_Extra14',
                        'Com_Cod_Extra15', 'Com_Can_Extra15', 'Com_Cod_Extra16', 'Com_Can_Extra16'];
  dataSource = new MatTableDataSource<any>();
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private LabColTrabajoService: LabColTrabajoService
  ){}


  ngOnInit(): void {

    this.onGetParams();
    
  }

  onGetParams(): void {
    this.route.queryParams.subscribe( params => {
      this.data = {
        Pro_CodR: params['Pro_CodE'] ?? ''
      };
    });

    this.cargarDatos(this.data.Pro_CodR);
  }

  cargarDatos(Pro_Cod: string): void {
    this.dataSource.data = [];
    this.LabColTrabajoService.getListarProcesoValor(Pro_Cod).subscribe({
      next:(response: any) =>{
        if(response.success){

          this.dataSource.data = response.elements;
          
        }else{
          this.dataSource.data = [];
        }
      },
      error: (error: any) =>
        console.log(error.error.message, 'Cancelar', { timeout: 3000 })
    });
  }

  onNuevo(): void {
    this.router.navigate(['NuevoCompExtra'], {
      queryParams: {
        AccionE: 'I',
        Pro_CodE: '',
        Com_Cod_ConE: 0,
        Com_Ran_IniE: 0,
        Com_Ran_FinE: 0,
        Com_Cod_Extra1E: 'EQT',
        Com_Can_Extra1E: 0,
        Com_Cod_Extra2E: 'SARABIB',
        Com_Can_Extra2E: 0,
        Com_Cod_Extra3E: 'AB55',
        Com_Can_Extra3E: 0,
        Com_Cod_Extra4E: 'LYOPRINT',
        Com_Can_Extra4E: 0,
        Com_Cod_Extra5E: 'SAL',
        Com_Can_Extra5E: 0,
        Com_Cod_Extra6E: 'CO3',
        Com_Can_Extra6E: 0,
        Com_Cod_Extra7E: 'SODA',
        Com_Can_Extra7E: 0,
        Com_Cod_Extra8E: 'SULFATO',
        Com_Can_Extra8E: 0,
        Com_Cod_Extra9E: 'RUCOTE',
        Com_Can_Extra9E: 0,
        Com_Cod_Extra10E: 'LEVELEN',
        Com_Can_Extra10E: 0,
        Com_Cod_Extra11E: '1raDosificacion',
        Com_Can_Extra11E: 0,
        Com_Cod_Extra12E: '2daDosificacion',
        Com_Can_Extra12E: 0,
        Com_Cod_Extra13E: '3raDosificacion',
        Com_Can_Extra13E: 0,
        Com_Cod_Extra14E: '1raDosificacionL',
        Com_Can_Extra14E: 0,
        Com_Cod_Extra15E: '2daDosificacionL',
        Com_Can_Extra15E: 0,
        Com_Cod_Extra16E: '3raDosificacionL',
        Com_Can_Extra16E: 0,
      }
    });
  }

  onEditar(row: any): void {
    this.router.navigate(['NuevoCompExtra'], {
      queryParams: {
        AccionE: 'U',
        Pro_CodE: row.pro_Cod,
        Com_Cod_ConE: row.com_Cod_Con,
        Com_Ran_IniE: row.com_Ran_Ini,
        Com_Ran_FinE: row.Com_Ran_Fin,
        Com_Cod_Extra1E: 'EQT',
        Com_Can_Extra1E: row.com_Can_Extra1,
        Com_Cod_Extra2E: 'SARABIB',
        Com_Can_Extra2E: row.com_Can_Extra2,
        Com_Cod_Extra3E: 'AB55',
        Com_Can_Extra3E: row.com_Can_Extra3,
        Com_Cod_Extra4E: 'LYOPRINT',
        Com_Can_Extra4E: row.com_Can_Extra4,
        Com_Cod_Extra5E: 'SAL',
        Com_Can_Extra5E: row.com_Can_Extra5,
        Com_Cod_Extra6E: 'CO3',
        Com_Can_Extra6E: row.com_Can_Extra6,
        Com_Cod_Extra7E: 'SODA',
        Com_Can_Extra7E: row.com_Can_Extra7,
        Com_Cod_Extra8E: 'SULFATO',
        Com_Can_Extra8E: row.com_Can_Extra8,
        Com_Cod_Extra9E: 'RUCOTE',
        Com_Can_Extra9E: row.com_Can_Extra9,
        Com_Cod_Extra10E: 'LEVELEN',
        Com_Can_Extra10E: row.com_Can_Extra10,
        Com_Cod_Extra11E: '1raDosificacion',
        Com_Can_Extra11E: row.com_Can_Extra11,
        Com_Cod_Extra12E: '2daDosificacion',
        Com_Can_Extra12E: row.com_Can_Extra12,
        Com_Cod_Extra13E: '3raDosificacion',
        Com_Can_Extra13E: row.com_Can_Extra13,
        Com_Cod_Extra14E: '1raDosificacionL',
        Com_Can_Extra14E: row.com_Can_Extra14,
        Com_Cod_Extra15E: '2daDosificacionL',
        Com_Can_Extra15E: row.com_Can_Extra15,
        Com_Cod_Extra16E: '3raDosificacionL',
        Com_Can_Extra16E: row.com_Can_Extra16,
      }
    });
  }

  onEliminar(row: any): void {
    const data = {
      Pro_Cod: row.pro_Cod,
      Com_Cod_Con: row.com_Cod_Con,
      Com_Ran_Ini: row.com_Ran_Ini,
      Flg_Status: 'I'
    }
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
        this.LabColTrabajoService.patchDeshabilitarProcesoValor(data).subscribe({
          next: (response: any) => {
            this.cargarDatos(this.data.Pro_CodR);
          }
        });
      }
    })
  }

  onCerrar(): void {
    this.router.navigate(['Mantenimientos']);
  }

}
