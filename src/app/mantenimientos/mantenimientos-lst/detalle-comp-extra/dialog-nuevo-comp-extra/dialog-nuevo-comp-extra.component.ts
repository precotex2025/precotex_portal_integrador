import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LabColTrabajoService } from '../../../../services/lab-col-trabajo/lab-col-trabajo.service';
import { response } from 'express';

interface data {
  AccionR: string,
  Pro_CodR: string,
  Com_Cod_ConR: number,
  Com_Ran_IniR: number,
  Com_Ran_FinR: number,
  Com_Cod_Extra1R: string,
  Com_Can_Extra1R: number,
  Com_Cod_Extra2R: string,
  Com_Can_Extra2R: number,
  Com_Cod_Extra3R: string,
  Com_Can_Extra3R: number,
  Com_Cod_Extra4R: string,
  Com_Can_Extra4R: number,
  Com_Cod_Extra5R: string,
  Com_Can_Extra5R: number,
  Com_Cod_Extra6R: string,
  Com_Can_Extra6R: number,
  Com_Cod_Extra7R: string,
  Com_Can_Extra7R: number,
  Com_Cod_Extra8R: string,
  Com_Can_Extra8R: number,
  Com_Cod_Extra9R: string,
  Com_Can_Extra9R: number,
  Com_Cod_Extra10R: string,
  Com_Can_Extra10R: number,
  Com_Cod_Extra11R: string,
  Com_Can_Extra11R: number,
  Com_Cod_Extra12R: string,
  Com_Can_Extra12R: number,
  Com_Cod_Extra13R: string,
  Com_Can_Extra13R: number,
  Com_Cod_Extra14R: string,
  Com_Can_Extra14R: number,
  Com_Cod_Extra15R: string,
  Com_Can_Extra15R: number,
  Com_Cod_Extra16R: string,
  Com_Can_Extra16R: number,
}

@Component({
  selector: 'app-dialog-nuevo-comp-extra',
  templateUrl: './dialog-nuevo-comp-extra.component.html',
  styleUrl: './dialog-nuevo-comp-extra.component.scss'
})

export class DialogNuevoCompExtraComponent implements OnInit {
  formulario!: FormGroup;
  modoEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private labColTrabajoService: LabColTrabajoService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onGetParams();
  }

  onGetParams(): void {
    this.formulario = this.fb.group({ 
      Pro_Cod: [''], 
      Com_Cod_Con: [0], 
      Com_Ran_Ini: [0], 
      Com_Ran_Fin: [0], 
      Com_Cod_Extra1: [''], 
      Com_Can_Extra1: [0], 
      Com_Cod_Extra2: [''], 
      Com_Can_Extra2: [0], 
      Com_Cod_Extra3: [''], 
      Com_Can_Extra3: [0], 
      Com_Cod_Extra4: [''], 
      Com_Can_Extra4: [0], 
      Com_Cod_Extra5: [''], 
      Com_Can_Extra5: [0], 
      Com_Cod_Extra6: [''], 
      Com_Can_Extra6: [0], 
      Com_Cod_Extra7: [''],
      Com_Can_Extra7: [0], 
      Com_Cod_Extra8: [''], 
      Com_Can_Extra8: [0], 
      Com_Cod_Extra9: [''], 
      Com_Can_Extra9: [0], 
      Com_Cod_Extra10: [''], 
      Com_Can_Extra10: [0], 
      Com_Cod_Extra11: [''], 
      Com_Can_Extra11: [0], 
      Com_Cod_Extra12: [''], 
      Com_Can_Extra12: [0], 
      Com_Cod_Extra13: [''], 
      Com_Can_Extra13: [0], 
      Com_Cod_Extra14: [''], 
      Com_Can_Extra14: [0], 
      Com_Cod_Extra15: [''], 
      Com_Can_Extra15: [0], 
      Com_Cod_Extra16: [''], 
      Com_Can_Extra16: [0]
    });

    this.route.queryParams.subscribe( params => {
      this.data = {
        AccionR: params['AccionE'] ?? '',
        Pro_CodR: params['Pro_CodE'] ?? '',
        Com_Cod_ConR: params['Com_Cod_ConE'] !== undefined ? Number(params['Com_Cod_ConE']) : 0,
        Com_Ran_IniR: params['Com_Ran_IniE'] !== undefined ? Number(params['Com_Ran_IniE']) : 0,
        Com_Ran_FinR: params['Com_Ran_FinE'] !== undefined ? Number(params['Com_Ran_FinE']) : 0,
        Com_Cod_Extra1R: params['Com_Cod_Extra1E'] ?? '',
        Com_Can_Extra1R: params['Com_Can_Extra1E'] !== undefined ? Number(params['Com_Can_Extra1E']) : 0,
        Com_Cod_Extra2R: params['Com_Cod_Extra2E'] ?? '',
        Com_Can_Extra2R: params['Com_Can_Extra2E'] !== undefined ? Number(params['Com_Can_Extra2E']) : 0,
        Com_Cod_Extra3R: params['Com_Cod_Extra3E'] ?? '',
        Com_Can_Extra3R: params['Com_Can_Extra3E'] !== undefined ? Number(params['Com_Can_Extra3E']) : 0,
        Com_Cod_Extra4R: params['Com_Cod_Extra4E'] ?? '',
        Com_Can_Extra4R: params['Com_Can_Extra4E'] !== undefined ? Number(params['Com_Can_Extra4E']) : 0,
        Com_Cod_Extra5R: params['Com_Cod_Extra5E'] ?? '',
        Com_Can_Extra5R: params['Com_Can_Extra5E'] !== undefined ? Number(params['Com_Can_Extra5E']) : 0,
        Com_Cod_Extra6R: params['Com_Cod_Extra6E'] ?? '',
        Com_Can_Extra6R: params['Com_Can_Extra6E'] !== undefined ? Number(params['Com_Can_Extra6E']) : 0,
        Com_Cod_Extra7R: params['Com_Cod_Extra7E'] ?? '',
        Com_Can_Extra7R: params['Com_Can_Extra7E'] !== undefined ? Number(params['Com_Can_Extra7E']) : 0,
        Com_Cod_Extra8R: params['Com_Cod_Extra8E'] ?? '',
        Com_Can_Extra8R: params['Com_Can_Extra8E'] !== undefined ? Number(params['Com_Can_Extra8E']) : 0,
        Com_Cod_Extra9R: params['Com_Cod_Extra9E'] ?? '',
        Com_Can_Extra9R: params['Com_Can_Extra9E'] !== undefined ? Number(params['Com_Can_Extra9E']) : 0,
        Com_Cod_Extra10R: params['Com_Cod_Extra10E'] ?? '',
        Com_Can_Extra10R: params['Com_Can_Extra10E'] !== undefined ? Number(params['Com_Can_Extra10E']) : 0,
        Com_Cod_Extra11R: params['Com_Cod_Extra11E'] ?? '',
        Com_Can_Extra11R: params['Com_Can_Extra11E'] !== undefined ? Number(params['Com_Can_Extra11E']) : 0,
        Com_Cod_Extra12R: params['Com_Cod_Extra12E'] ?? '',
        Com_Can_Extra12R: params['Com_Can_Extra12E'] !== undefined ? Number(params['Com_Can_Extra12E']) : 0,
        Com_Cod_Extra13R: params['Com_Cod_Extra13E'] ?? '',
        Com_Can_Extra13R: params['Com_Can_Extra13E'] !== undefined ? Number(params['Com_Can_Extra13E']) : 0,
        Com_Cod_Extra14R: params['Com_Cod_Extra14E'] ?? '',
        Com_Can_Extra14R: params['Com_Can_Extra14E'] !== undefined ? Number(params['Com_Can_Extra14E']) : 0,
        Com_Cod_Extra15R: params['Com_Cod_Extra15E'] ?? '',
        Com_Can_Extra15R: params['Com_Can_Extra15E'] !== undefined ? Number(params['Com_Can_Extra15E']) : 0,
        Com_Cod_Extra16R: params['Com_Cod_Extra16E'] ?? '',
        Com_Can_Extra16R: params['Com_Can_Extra16E'] !== undefined ? Number(params['Com_Can_Extra16E']) : 0
      };
    });
    console.log('los datos en data son: ', this.data);
    this.formulario.setValue({
      Pro_Cod: this.data.Pro_CodR,
      Com_Cod_Con: this.data.Com_Cod_ConR,
      Com_Ran_Ini: this.data.Com_Ran_IniR,
      Com_Ran_Fin: this.data.Com_Ran_FinR,
      Com_Cod_Extra1: this.data.Com_Cod_Extra1R,
      Com_Can_Extra1: this.data.Com_Can_Extra1R,	
      Com_Cod_Extra2: this.data.Com_Cod_Extra2R,	
      Com_Can_Extra2: this.data.Com_Can_Extra2R,	
      Com_Cod_Extra3: this.data.Com_Cod_Extra3R,	
      Com_Can_Extra3: this.data.Com_Can_Extra3R,	
      Com_Cod_Extra4: this.data.Com_Cod_Extra4R,	
      Com_Can_Extra4: this.data.Com_Can_Extra4R,	
      Com_Cod_Extra5: this.data.Com_Cod_Extra5R,	
      Com_Can_Extra5: this.data.Com_Can_Extra5R,	
      Com_Cod_Extra6: this.data.Com_Cod_Extra6R,	
      Com_Can_Extra6: this.data.Com_Can_Extra6R,	
      Com_Cod_Extra7: this.data.Com_Cod_Extra7R,	
      Com_Can_Extra7: this.data.Com_Can_Extra7R,	
      Com_Cod_Extra8: this.data.Com_Cod_Extra8R,	
      Com_Can_Extra8: this.data.Com_Can_Extra8R,	
      Com_Cod_Extra9: this.data.Com_Cod_Extra9R,	
      Com_Can_Extra9: this.data.Com_Can_Extra9R,	
      Com_Cod_Extra10: this.data.Com_Cod_Extra10R,
      Com_Can_Extra10: this.data.Com_Can_Extra10R,
      Com_Cod_Extra11: this.data.Com_Cod_Extra11R,
      Com_Can_Extra11: this.data.Com_Can_Extra11R,
      Com_Cod_Extra12: this.data.Com_Cod_Extra12R,
      Com_Can_Extra12: this.data.Com_Can_Extra12R,
      Com_Cod_Extra13: this.data.Com_Cod_Extra13R,
      Com_Can_Extra13: this.data.Com_Can_Extra13R,
      Com_Cod_Extra14: this.data.Com_Cod_Extra14R,
      Com_Can_Extra14: this.data.Com_Can_Extra14R,
      Com_Cod_Extra15: this.data.Com_Cod_Extra15R,
      Com_Can_Extra15: this.data.Com_Can_Extra15R,
      Com_Cod_Extra16: this.data.Com_Cod_Extra16R,
      Com_Can_Extra16: this.data.Com_Can_Extra16R
    });

  }

  guardar(): void {
  if (this.formulario.valid) {
    const data = {
      Pro_Cod: this.formulario.value.Pro_Cod,
      Pro_Cod_Org: this.data.Pro_CodR,
      Com_Cod_Con: this.formulario.value.Com_Cod_Con,
      Com_Cod_Con_Org: this.data.Com_Cod_ConR,
      Com_Ran_Ini: this.formulario.value.Com_Ran_Ini,
      Com_Ran_Ini_Org: this.data.Com_Ran_IniR,
      Com_Ran_Fin: this.formulario.value.Com_Ran_Fin,
      Com_Cod_Extra1: this.formulario.value.Com_Cod_Extra1,
      Com_Can_Extra1: this.formulario.value.Com_Can_Extra1,
      Com_Cod_Extra2: this.formulario.value.Com_Cod_Extra2,
      Com_Can_Extra2: this.formulario.value.Com_Can_Extra2,
      Com_Cod_Extra3: this.formulario.value.Com_Cod_Extra3,
      Com_Can_Extra3: this.formulario.value.Com_Can_Extra3,
      Com_Cod_Extra4: this.formulario.value.Com_Cod_Extra4,
      Com_Can_Extra4: this.formulario.value.Com_Can_Extra4,
      Com_Cod_Extra5: this.formulario.value.Com_Cod_Extra5,
      Com_Can_Extra5: this.formulario.value.Com_Can_Extra5,
      Com_Cod_Extra6: this.formulario.value.Com_Cod_Extra6,
      Com_Can_Extra6: this.formulario.value.Com_Can_Extra6,
      Com_Cod_Extra7: this.formulario.value.Com_Cod_Extra7,
      Com_Can_Extra7: this.formulario.value.Com_Can_Extra7,
      Com_Cod_Extra8: this.formulario.value.Com_Cod_Extra8,
      Com_Can_Extra8: this.formulario.value.Com_Can_Extra8,
      Com_Cod_Extra9: this.formulario.value.Com_Cod_Extra9,
      Com_Can_Extra9: this.formulario.value.Com_Can_Extra9,
      Com_Cod_Extra10: this.formulario.value.Com_Cod_Extra10,
      Com_Can_Extra10: this.formulario.value.Com_Can_Extra10,
      Com_Cod_Extra11: this.formulario.value.Com_Cod_Extra11,
      Com_Can_Extra11: this.formulario.value.Com_Can_Extra11,
      Com_Cod_Extra12: this.formulario.value.Com_Cod_Extra12,
      Com_Can_Extra12: this.formulario.value.Com_Can_Extra12,
      Com_Cod_Extra13: this.formulario.value.Com_Cod_Extra13,
      Com_Can_Extra13: this.formulario.value.Com_Can_Extra13,
      Com_Cod_Extra14: this.formulario.value.Com_Cod_Extra14,
      Com_Can_Extra14: this.formulario.value.Com_Can_Extra14,
      Com_Cod_Extra15: this.formulario.value.Com_Cod_Extra15,
      Com_Can_Extra15: this.formulario.value.Com_Can_Extra15,
      Com_Cod_Extra16: this.formulario.value.Com_Cod_Extra16,
      Com_Can_Extra16: this.formulario.value.Com_Can_Extra16
    };

    if(this.data.AccionR == 'I'){
      this.labColTrabajoService.postRegistrarProcesoValor(data).subscribe({
        next: (response: any) => {

        },
        error: (error: any) => {
          console.log(error.error.message, 'Cancelar', { timeout: 3000 });
        }
      });
    }else{
      this.labColTrabajoService.patchModificarProcesoValor(data).subscribe({
        next: (response: any) => {

        },
        error: (error: any) => {
          console.log(error.error.message, 'Cancelar', { timeout: 3000 });
        }
      });
    }
    
  }
}


  cancelar(): void {
    this.router.navigate(['DetalleCompExtra']);
  }
}
