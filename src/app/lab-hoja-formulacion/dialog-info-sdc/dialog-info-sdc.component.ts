import { Component, OnInit, ViewChild, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';

interface data {
  Title: string,
  Num_SDC: number,
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

@Component({
  selector: 'app-dialog-info-sdc',
  templateUrl: './dialog-info-sdc.component.html',
  styleUrl: './dialog-info-sdc.component.scss'
})
export class DialogInfoSdcComponent implements OnInit{

  constructor(
    private LabColTrabService: LabColTrabajoService, 
    private SpinnerService: NgxSpinnerService,
    private dialogref: MatDialogRef<DialogInfoSdcComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
  ){}
  ngOnInit(): void {
    this.onLoadData();
  }

  dataInforme: Array<informacionSDC> = [];
  onLoadData(){
    
    console.log('# SDC ', this.data.Num_SDC);
    console.log('# Secuencia ', this.data.Num_Sec);
    let Corr_Carta = this.data.Num_SDC;
    let Sec = this.data.Num_Sec;
    this.SpinnerService.show();
    this.dataInforme = [];
    this.LabColTrabService.getCargarInformeSDC(Corr_Carta, Sec).subscribe({
      next:(response: any) => {
        if(response.success){
          this.dataInforme = response.elements;
            console.log('contenido que cargará en la grilla', this.dataInforme);
            this.SpinnerService.hide();
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })

  }






}
