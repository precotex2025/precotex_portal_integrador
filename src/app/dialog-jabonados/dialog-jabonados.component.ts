import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from '../lab-dosificacion/dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatSort } from '@angular/material/sort';

interface data_jabonado {
  corr_Carta: number;
  sec: number;
  correlativo: number;
  descripcion_color: string;
  tela: string;
  ph_Jab: number;
}

@Component({
  selector: 'app-dialog-jabonados',
  templateUrl: './dialog-jabonados.component.html',
  styleUrl: './dialog-jabonados.component.scss'
})
export class DialogJabonadosComponent {
  
  @ViewChild(MatSort) sort!: MatSort;   
  constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService
  ){}


  columnsToDisplay: string[] = [
    'corr_Carta', 
    'sec', 
    'correlativo', 
    'descripcion_Color', 
    'tela', 
    'jab_Des',
    'can_Jabo',
    'ph_Jab'
  ];

  ngOnInit(): void {
    this.onListarJabonado();
  }
  
  dataSource : MatTableDataSource<data_jabonado> = new MatTableDataSource();
  dataListadoJabonado = [];
  onListarJabonado(){    
    
    this.SpinnerService.show();
    this.dataListadoJabonado = [];
    this.LabColTrabajoService.getListarJabonado().subscribe({
      next:(response: any) => {
        if(response.success){
          this.dataListadoJabonado = response.elements;
          this.dataSource.data = this.dataListadoJabonado;
          this.dataSource.sort = this.sort;
          this.SpinnerService.hide();
        }
      },
      error:(error) => {
        this.SpinnerService.hide();
      }
    })
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
          Title: "PH Jabonado",
          Corr_Carta: num_sdc,
          Sec: sec,
          Correlativo: correlativo,
          Condicion: 3
        }
      });
      dialogref.afterClosed().subscribe(result => {
        this.onListarJabonado();
      });
  }

}
