import { Component, OnInit, ViewChild, Inject, Optional, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';

interface data {
  Title: string,
  Num_SDC: any,
  Num_Sec: number,
}

interface informacionSDC{
  corr_Carta: string;
  descripcion: string;
  descripcion_Color: string;
  pantone: string;
  com_Comer: string;
  ruta: string[];       
  solidez: string[];    
}

interface informacionSDCProduccion{
  corr_Carta: string;
  descripcion: string;
  cur_Ten: string;
  cla_Oc: string;
  temporada: string;
  estilo: string;
  op: string;
  cod_GrupoTex: string;
  oc: string;
  maq_Tinto: string;
  ref_Par: string;
  ref_Com: string;
  lote: string;
  obs: string;
  ruta: string[];        
}

@Component({
  selector: 'app-dialog-info-sdc',
  templateUrl: './dialog-info-sdc.component.html',
  styleUrl: './dialog-info-sdc.component.scss'
})
export class DialogInfoSdcComponent implements OnInit, AfterViewInit{

  constructor(
    private LabColTrabService: LabColTrabajoService, 
    private SpinnerService: NgxSpinnerService,
    private dialogref: MatDialogRef<DialogInfoSdcComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
  ){}
  ngOnInit(): void {
    this.onLoadData();
  }

  ngAfterViewInit(): void {
    const dialogContainer = document.querySelector('.mat-dialog-container'); 
    if (dialogContainer) { 
      dialogContainer.scrollTop = 0; 
    }
  }

  dataInforme: Array<informacionSDC> = [];
  dataInformeProduccion: Array<informacionSDCProduccion> = [];
  onLoadData(){
    let Corr_Carta = this.data.Num_SDC;
    let Sec = this.data.Num_Sec;
    this.SpinnerService.show();
    this.dataInforme = [];
    this.LabColTrabService.getCargarInformeSDC(Corr_Carta, Sec).subscribe({
      next:(response: any) => {
        if(response.success){
          
          let empiezaConNumero = !isNaN(Number(Corr_Carta.charAt(0))) && Corr_Carta.charAt(0) !== "0";

          if (empiezaConNumero) {
            this.dataInforme = response.elements;
          } else {
            this.dataInformeProduccion = response.elements;
          }
          console.log(this.dataInformeProduccion)
            //console.log('contenido que cargará en la grilla', this.dataInforme);
            this.SpinnerService.hide();
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })

  }






}
