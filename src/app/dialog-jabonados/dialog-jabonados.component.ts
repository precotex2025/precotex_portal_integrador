import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from '../lab-dosificacion/dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../authentication/auth.service';
import { Router } from '@angular/router';

interface data_jabonado {
  corr_Carta: any;
  sec: number;
  correlativo: number;
  descripcion_color: string;
  tela: string;
  ph_Jab: number[];
}

@Component({
  selector: 'app-dialog-jabonados',
  templateUrl: './dialog-jabonados.component.html',
  styleUrl: './dialog-jabonados.component.scss'
})
export class DialogJabonadosComponent {

  @ViewChild(MatSort) sort!: MatSort;
  Usuario: string = '';
  constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private authService: AuthService,
    private router: Router
  ) { }

  filtroSeleccionado: string = 'pendientes';

  columnsToDisplay: string[] = [
    'corr_Carta',
    'sec',
    'correlativo',
    'descripcion_Color',
    // 'tela', 
    'jab_Des',
    'can_Jabo',
    //'ph_Jab'
  ];

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      this.Usuario = this.authService.getUsuario()!;
    } else {
      this.router.navigate(['/login']);
    }

    this.onListarJabonado(this.Usuario);
  }

  dataSource: MatTableDataSource<data_jabonado> = new MatTableDataSource();
  dataListadoJabonado = [];


  getPhColumns(): string[] {
    const max = Math.max(...this.dataSource.data.map((r: any) => r.can_Jabo || 1));
    return Array.from({ length: max }, (_, i) => 'ph_Jab' + (i + 1));
  }

  onListarJabonado(Usr_Cod: string) {
    this.SpinnerService.show();
    this.LabColTrabajoService.getListarJabonado(Usr_Cod).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.dataListadoJabonado = response.elements.map((item: any) => {
            const phArray = Array(item.can_Jabo).fill(null);

            if (item.ph_Jab && item.ph_Jab !== 0) {
              phArray[0] = item.ph_Jab;
            }

            if (item.ph_Jab2) phArray[1] = item.ph_Jab2;
            if (item.ph_Jab3) phArray[2] = item.ph_Jab3;

            return {
              ...item,
              ph_Jab: phArray
            };
          });

          this.dataSource.data = this.dataListadoJabonado;
          this.dataSource.sort = this.sort;

          // recalcular columnas dinámicas
          this.columnsToDisplay = [
            'corr_Carta',
            'sec',
            'correlativo',
            'descripcion_Color',
            'jab_Des',
            'can_Jabo',
            ...this.getPhColumns()
          ];

          this.SpinnerService.hide();
        }
      },
      error: () => this.SpinnerService.hide()
    });
  }

  onListarJabonadoExcluido(Usr_Cod: string): void {
    this.SpinnerService.show();
    this.LabColTrabajoService.getListarJabonadoExcluido(Usr_Cod).subscribe({
      next: (response: any) => {
        if(response.success){
          this.dataListadoJabonado = response.elements.map((item: any) => {
            const phArray = Array(item.can_Jabo).fill(null);

            if (item.ph_Jab && item.ph_Jab !== 0) {
              phArray[0] = item.ph_Jab;
            }
            
            if (item.ph_Jab2) phArray[1] = item.ph_Jab2;
            if (item.ph_Jab3) phArray[2] = item.ph_Jab3;

            return {
              ...item,
              ph_Jab: phArray
            };
          });

          this.dataSource.data = this.dataListadoJabonado;
          this.dataSource.sort = this.sort;

          this.columnsToDisplay = [
            'corr_Carta',
            'sec',
            'correlativo',
            'descripcion_Color',
            'jab_Des',
            'can_Jabo',
            ...this.getPhColumns()
          ];

          this.SpinnerService.hide();
        }
      },
      error: (error: any) => {

      }
    });
  }

  ingresarPH(row: any, jabIndex: number): void {
    let num_sdc = row.corr_Carta;
    let sec = row.sec;
    let correlativo = row.correlativo;

    let dialogref = this.dialog.open(DialogAgregarPhComponent, {
      width: '500px',
      height: '300px',
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: `PH Jabonado ${jabIndex}`,
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        JabonadoIndex: jabIndex,
        Condicion: 3
      }
    });

    dialogref.afterClosed().subscribe(result => {
      this.onListarJabonado(this.Usuario);
    });
  }


  aplicarFiltrarTodo(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  aplicarFiltroRadio(): void {
    if (this.filtroSeleccionado === 'pendientes') {
      this.onListarJabonado(this.Usuario); 
    } else if (this.filtroSeleccionado === 'completos') {
      this.onListarJabonadoExcluido(this.Usuario); 
    }
  }


}
