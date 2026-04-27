import { Component, OnInit, ViewChild, Inject, Optional, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';

interface data {
  Title: string,
  Num_SDC: any,
  Num_Sec: number,
  TipoReceta: string
}

interface Luz {
  descripcion: string;
}

interface informacionSDC{
  corr_Carta: string;
  descripcion: string;
  descripcion_Color: string;
  pantone: string;
  com_Comer: string;
  ruta: string[];       
  solidez: string[];
  luz: Luz[];
  familia: string;
  cur_Ten: string;
  pre_Id: number;
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
  familia: string;  
  pre_Id: number;
}

@Component({
  selector: 'app-dialog-info-sdc',
  templateUrl: './dialog-info-sdc.component.html',
  styleUrl: './dialog-info-sdc.component.scss'
})
export class DialogInfoSdcComponent implements OnInit, AfterViewInit{


  previo: { codigo: number, nombre: string }[] = [];
  previoSeleccionado: number = 0;
  constructor(
    private LabColTrabService: LabColTrabajoService, 
    private SpinnerService: NgxSpinnerService,
    private dialogref: MatDialogRef<DialogInfoSdcComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
  ){}
  ngOnInit(): void {
    this.getListarPrevios();
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
    let TipoReceta = this.data.TipoReceta
    this.SpinnerService.show();
    this.dataInforme = [];
    this.LabColTrabService.getCargarInformeSDC(Corr_Carta, Sec, TipoReceta).subscribe({
      next:(response: any) => {
        if(response.success){
          
          let empiezaConNumero = !isNaN(Number(Corr_Carta.charAt(0))) && Corr_Carta.charAt(0) !== "0";
          
          if (empiezaConNumero) {
            this.dataInforme = response.elements;
            this.previoSeleccionado = this.dataInforme[0].pre_Id;
          } else {
            this.dataInformeProduccion = response.elements;
            this.previoSeleccionado = this.dataInformeProduccion[0].pre_Id;
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


  getListarPrevios(): void {
    this.LabColTrabService.getListarPrevios().subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('>>>>>>>>>>>>>>>>>>>>', response.elements);
          this.previo = response.elements.map((p: any) => ({
            codigo: p.pre_Id,
            nombre: p.pre_Des
          }));
        }
      }
    });
  }

  patchActualizarPrevio(): void {

    const data = {
      corr_Carta: this.data.Num_SDC,
      sec: this.data.Num_Sec,
      previo: this.previoSeleccionado
    }

    console.log('>>>>>>>>>>>>>>', data);

    this.LabColTrabService.patchActualizarPrevio(data).subscribe({
      next: (response: any) => {
        // this.toastr.success(response.message, 'Exito', {
        //   timeOut: 2500
        // });
      },
      error: (error: any) => { }
    });
  }



}
