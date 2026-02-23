import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner'; 
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { DialogLabColTrabajoDetalleComponent } from './dialog-lab-col-trabajo-detalle/dialog-lab-col-trabajo-detalle.component';
import { GlobalVariable } from '../../VarGlobals';
import { AuthService } from '../../authentication/auth.service';


interface data_cola_trab{
  corr_Carta: number
}

@Component({
  selector: 'app-lab-col-trabajo',
  templateUrl: './lab-col-trabajo.component.html',
  styleUrl: './lab-col-trabajo.component.scss'
})
export class LabColTrabajoComponent implements OnInit{
  usuario: string | null = null;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  //usuario = '';
  constructor
  (
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private SpinnerService: NgxSpinnerService,
    private LabColaTrabajoService: LabColTrabajoService,
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ){ }

  range = new FormGroup({
    start: new FormControl(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)),
    end: new FormControl(new Date),
  });
  
  ngOnInit(): void {

    if (this.authService.isLoggedIn()) { 
      console.log('Usuario activo: -------', this.authService.getUsuario()); 
    } else { 
      this.router.navigate(['/login']); 
    }
    this.usuario = this.authService.getUsuario();
    // this.usuario = GlobalVariable.vusu;
    console.log('EL USUARIO EN ESTE PUNTO ES: ---------', this.usuario);
    this.onGetListaSDC();
  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] =  [
    'detalle',
    'cliente',
    'num_sdc',
    'des_tela',
    //'fec_asig',
    //'dias_lab',
    'fec_comp',
    'dias_comp',
    'estado',
    'entregado'
  ]

  dataSource: MatTableDataSource<data_cola_trab> = new MatTableDataSource();
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataListadoSDC: Array<any> = [];
  estadoSeleccionado: string = '01';

  filtrarPorEstado() {
  
  }

  onGetListaSDC(){
      const startControl = this.range.get('start');
      const endControl = this.range.get('end');
      const fecIni: Date | null = startControl?.value ?? null;
      const fecFin: Date | null = endControl?.value ?? null;

    
    if(fecIni == null || fecFin == null){
      // this.matSnackBar.open("Ingrese Rango de Fechas", "Cerrar",
      //   {horizontalPosition:'center', verticalPosition:'top', duration: 1500}
      // );
      return;
    }else{
    let estado: string = this.estadoSeleccionado;
    // const usuario: string = this.usuario;
    //console.log('El usuario antes de listar es: -------', usuario);
    this.SpinnerService.show();
    this.dataListadoSDC = [];
    this.LabColaTrabajoService.getListaSDCPorEstado(estado, fecIni, fecFin, this.usuario!).subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){         
            this.dataListadoSDC = response.elements;
            console.log('dataListadoSDC: ', this.dataListadoSDC);
            this.dataSource.data = this.dataListadoSDC;
            this.dataSource.sort = this.sort;
            this.SpinnerService.hide();
          }else{
            this.dataListadoSDC = [];
            this.dataSource.data = [];
            this.SpinnerService.hide();
          }
        }else{
          this.dataListadoSDC = [];
          this.dataSource.data = [];
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


  }

  getColorClase(row: any): string {
    const dias = row.dias_Falt_Compromiso;
    if(this.estadoSeleccionado === '01'){
      if (dias <= 0) {
        return 'fila-roja';      // YA SE PASARON
      } else if (dias <= 3) {
        return 'fila-amarilla';   // TIEMPO AJUSTADO
      } else {
        return 'fila-verde';       // TIEMPO DE SOBRA
      }
    }else{
      return '';
    }

  }

  onCreate(objeto: any){

    let num_sdc = objeto.corr_Carta;

    let dialogref = this.dialog.open(DialogLabColTrabajoDetalleComponent, {
      panelClass: 'dialog-tablet',
      width:'900px',
      height: '400px',
      maxWidth:'none',
      disableClose: false,
      data:{
        Title: "Detalle",
        Num_SDC: num_sdc
      }
    });
    dialogref.afterClosed().subscribe(result =>
    { this.onGetListaSDC()}
    );
  }

  aplicarFiltrarTodo(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  filtrarTodo(): void{
    
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      
      const estadoOk = !this.estadoSeleccionado || data.estado === this.estadoSeleccionado;
      
      let fechaOk = true;

      if (this.range.value.start && this.range.value.end) {
        const fecha = new Date(data.fec_creacion);
        fechaOk = fecha >= this.range.value.start && fecha <= this.range.value.end;
      }

      const texto = filter.toLowerCase();
      
      const textoOk = Object.values(data).some(val =>
        val?.toString().toLowerCase().includes(texto)
      );

      return estadoOk && fechaOk && textoOk;
    };
  
  }


}
