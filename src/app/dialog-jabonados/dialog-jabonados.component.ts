import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAgregarPhComponent } from '../lab-dosificacion/dialog-agregar-ph/dialog-agregar-ph.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../authentication/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LabDosificacionComponent } from '../lab-dosificacion/lab-dosificacion.component';
import { MatSelectChange } from '@angular/material/select';
import Swal from 'sweetalert2';

interface data_jabonado {
  corr_Carta: any;
  sec: number;
  correlativo: number;
  descripcion_color: string;
  tela: string;
  ph_Jab: number[];
  tip_Ten: string;
}

@Component({
  selector: 'app-dialog-jabonados',
  templateUrl: './dialog-jabonados.component.html',
  styleUrl: './dialog-jabonados.component.scss'
})
export class DialogJabonadosComponent {
  @ViewChild('modalPosiciones') modalPosiciones!: TemplateRef<any>;
  @ViewChild(MatSort) sort!: MatSort;
  Usuario: string = '';
  constructor(
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService,
    private LabColTrabajoService: LabColTrabajoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  filtroSeleccionado: string = 'pendientes';
  ahibaSeleccionado: number = 0;
  cantidadRequerida: number = 0;
  seleccionadosActuales: number = 0;
  ahiSeleccionadoNombre: string = '';
  posiciones: { numero: number, seleccionado: boolean, ocupado: boolean }[] = [];
  curvasAhiba: { codigo: number, nombre: string, cantidadPosiciones: number, estado: string, estadoCarga: string }[] = [];

  columnsToDisplay: string[] = [
    'corr_Carta',
    'sec',
    'correlativo',
    'descripcion_Color',
    // 'tela', 
    'jab_Des',
    'can_Jabo',
    //'ph_Jab'
    'tipo_fijado'
    //'ph_Des'
  ];

  tiposFijado: { nombre: string, codigo: number }[] = [];

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      this.Usuario = this.authService.getUsuario()!;
    } else {
      this.router.navigate(['/login']);
    }

    this.onListarJabonado(this.Usuario);
    this.getObtenerFijadosTipo();
    this.listarAhibas();
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
            'seleccion',
            'corr_Carta',
            'sec',
            'correlativo',
            'descripcion_Color',
            'neutralizado',
            'ph_Neu',
            'jab_Des',
            'can_Jabo'
            //...this.getPhColumns(),
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
              ph_Jab: phArray,
              fijadoSeleccionado: item.tip_Fij,
              //fijado: item.fijado
            };
          });
          console.log(':::::::::::::::::::::.', this.dataListadoJabonado);
          this.dataSource.data = this.dataListadoJabonado;
          this.dataSource.sort = this.sort;

          this.columnsToDisplay = [
            'corr_Carta',
            'sec',
            'correlativo',
            'descripcion_Color',
            'jab_Des',
            // 'dosificacion1',
            // 'dosificacion2',
            // 'dosificacion3',
            // 'sod_gr',
            'can_Jabo',
            ...this.getPhColumns(),
            'descarga',
            'tipo_fijado',
            'ph_Des'
            
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
    let tip_Ten = row.tip_Ten;

    if (tip_Ten === 'O') {
      this.toastr.warning('No se puede ingresar ph de un BLANCO');
      return;
    }

    if (this.filtroSeleccionado === 'completosDescarga'){
      this.toastr.warning('No se puede modificar una corrida completa');
      return;
    }

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
        Condicion: 3,
        Tip_Ten: tip_Ten
      }
    });

    dialogref.afterClosed().subscribe(result => {
      this.aplicarFiltroRadio();
      
    });
  }

  ingresarPHDescarga(row: any): void {
    let num_sdc = row.corr_Carta;
    let sec = row.sec;
    let correlativo = row.correlativo;
    let tip_Ten = row.tip_Ten;
  
    if (tip_Ten === 'O') {
      this.toastr.warning('No se puede ingresar ph de un BLANCO');
      return;
    }

    if (this.filtroSeleccionado === 'completosDescarga'){
      this.toastr.warning('No se puede modificar una corrida completa');
      return;
    }

    let dialogref = this.dialog.open(DialogAgregarPhComponent, {
      width: '500px',
      height: '300px',
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: `PH Descarga`,
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        Condicion: 4,
        Tip_Ten: tip_Ten
      }
    });

    dialogref.afterClosed().subscribe(result => {
      this.onListarJabonadoExcluido(this.Usuario);
    });
  }

  ingresarPHNeutralizado(row: any): void {
    let num_sdc = row.corr_Carta;
    let sec = row.sec;
    let correlativo = row.correlativo;
    let tip_Ten = row.tip_Ten;
    if (this.filtroSeleccionado === 'completosDescarga') {
      this.toastr.warning('No se puede modificar una corrida completa');
      return;
    }

    let dialogref = this.dialog.open(DialogAgregarPhComponent, {
      width: '500px',
      height: '300px',
      disableClose: false,
      panelClass: 'my-class',
      data: {
        Title: `PH Neutralizado`,
        Corr_Carta: num_sdc,
        Sec: sec,
        Correlativo: correlativo,
        Condicion: 5,
        Tip_Ten: tip_Ten
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
      this.listarAhibas();
    } else if (this.filtroSeleccionado === 'completos') {
      this.onListarJabonadoExcluido(this.Usuario); 
    }
  }

  cambiarEstado(valor: 'pendientes' | 'completos' | 'completosDescarga'): void {
    this.filtroSeleccionado = valor;
    if (this.filtroSeleccionado === 'pendientes') {
      this.onListarJabonado(this.Usuario);
    } else if (this.filtroSeleccionado === 'completos') {
      this.onListarJabonadoExcluido(this.Usuario);
    } else if (this.filtroSeleccionado === 'completosDescarga'){
      this.onListarJabonadoExcluidoDescarga(this.Usuario);
    }
  }

  getObtenerFijadosTipo(): void {
    this.tiposFijado = [];
    this.LabColTrabajoService.getObtenerFijadosTipo().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            
            this.tiposFijado = response.elements.map((t: any) => ({
              nombre: t.fij_Tip_Des,
              codigo: t.fij_Tip_Id
            }));

            //console.log('::::::::::::::::::...', this.tiposFijado);
          }
        }
      }
    });
  }

  patchActualizarFijadoTipo(row: any): void {

    const data = {
      corr_Carta: row.corr_Carta,
      sec: row.sec,
      correlativo: row.correlativo,
      tip_Fij: row.fijadoSeleccionado,
      tip_Ten: row.tip_Ten
    }

    this.LabColTrabajoService.patchActualizarFijadoTipo(data).subscribe({
      next: (response: any) => {
        //console.log(':::::::::::::::::::::.', data);
        this.toastr.success(response.message, 'Exito', {
          timeOut: 2500
        });

        this.onListarJabonadoExcluido(this.Usuario);
      },  
      error: (error: any) => {}
    });
  }

  onCreate(): void {
      let num_sdc = 0;
      const ahiba = this.curvasAhiba.find(c => c.codigo === this.ahibaSeleccionado);
      let estado = ahiba?.estado
      let dialogref = this.dialog.open(LabDosificacionComponent, {
        width: '900px',
        height: '500px',
        autoFocus: false,
        disableClose: false,
        maxWidth: 'none',
        panelClass: 'my-class',
        data: {
          Title: "Detalle",
          Num_SDC: "",
          Estado: estado,
        }
      });
    }

  listarAhibas(): void {
    this.SpinnerService.show();
    this.curvasAhiba = [];
    this.LabColTrabajoService.getListaAhibas().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            console.log('las ahibas son: ', response.elements);
            this.curvasAhiba = response.elements.map((c: any) => ({
              codigo: c.ahi_Id,
              nombre: c.ahi_Des,
              cantidadPosiciones: c.ahi_Pos_Can,
              estado: c.ahi_Est_Pro,
              estadoCarga: c.ahi_Est_Carga
            }));
            this.SpinnerService.hide();
          } else {
            this.curvasAhiba = [];
            this.SpinnerService.hide();
          }
        } else {
          this.curvasAhiba = [];
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

  // validarEstadoahibaPorCodigo(codigo: number): Promise<number> {
  //   this.SpinnerService.show();

  //   return new Promise((resolve, reject) => {
  //     this.LabColTrabajoService.getListaAhibas().subscribe({
  //       next: (response: any) => {
  //         if (response.success && response.totalElements > 0) {
  //           this.curvasAhiba = response.elements.map((c: any) => ({
  //             codigo: c.ahi_Id,
  //             nombre: c.ahi_Des,
  //             cantidadPosiciones: c.ahi_Pos_Can,
  //             estado: c.ahi_Est_Pro
  //           }));

  //           const ahibaEncontrada = this.curvasAhiba.find(c => c.codigo === codigo);

  //           if (ahibaEncontrada) {
  //             if (ahibaEncontrada.estado === 'I') {
  //               resolve(1);
  //             } else {
  //               resolve(0);
  //             }
  //           } else {
  //             this.toastr.error('No se encontró la ahiba con ese código');
  //             resolve(0);
  //           }

  //           this.SpinnerService.hide();
  //         } else {
  //           this.curvasAhiba = [];
  //           this.SpinnerService.hide();
  //           resolve(0);
  //         }
  //       },
  //       error: (error: any) => {
  //         this.SpinnerService.hide();
  //         console.log(error.error.message, 'Cerrar', { timeout: 2500 });
  //         reject(error);
  //       }
  //     });
  //   });
  // }

  validarEstadoahibaPorCodigo(codigo: number, tipoCarga: 'D' | 'J'): Promise<number> {
    this.SpinnerService.show();

    return new Promise((resolve, reject) => {
      this.LabColTrabajoService.getListaAhibas().subscribe({
        next: (response: any) => {
          if (response.success && response.totalElements > 0) {
            this.curvasAhiba = response.elements.map((c: any) => ({
              codigo: c.ahi_Id,
              nombre: c.ahi_Des,
              cantidadPosiciones: c.ahi_Pos_Can,
              estado: c.ahi_Est_Pro,
              estadoCarga: c.ahi_Est_Carga
            }));

            const ahiba = this.curvasAhiba.find(c => c.codigo === codigo);

            if (ahiba) {

              if (ahiba.estadoCarga === 'N' || ahiba.estadoCarga === tipoCarga) {

                if (ahiba.estado === 'I') {
                  resolve(1);
                } else {
                  resolve(0);
                }
              } else {
                resolve(2);
              }
            } else {
              this.toastr.error('No se encontró la ahiba con ese código');
              resolve(3);
            }


            this.SpinnerService.hide();
          } else {
            this.curvasAhiba = [];
            this.SpinnerService.hide();
            resolve(0);
          }
        },
        error: (error: any) => {
          this.SpinnerService.hide();
          reject(error);
        }
      });
    });
  }

  async onSeleccionarAhiba(event: MatSelectChange): Promise<void> {
      this.ahibaSeleccionado = event.value;
      console.log('Código seleccionado:', this.ahibaSeleccionado);
  
      const ahiba = this.curvasAhiba.find(c => c.codigo === event.value);
  
      this.ahiSeleccionadoNombre = ahiba!.nombre;

      const estado = await this.validarEstadoahibaPorCodigo(this.ahibaSeleccionado, 'J');
  
      if (this.ahibaSeleccionado > 0) {

        if (estado === 1) {
          this.toastr.warning('La ahiba ya cuenta con un proceso iniciado');
        } else if (estado === 2) {
          this.toastr.warning('No se puede mezclar AHIBA con diferente tipo de carga');
        } else if (estado === 3) {
          this.toastr.warning('Seleccione una AHIBA válida');
        }
        else {
          this.abrirModalPosiciones(ahiba!.cantidadPosiciones, ahiba!.nombre);
        }
      }
    }

  seleccionadasModal: any[] = [];
  abrirModalPosiciones(cantidad: number, ahiNombre: string) {
    const seleccionadas = this.dataSource.data.filter((row: any) => row.seleccionado);
    const cantidadSeleccionada = this.dataSource.data
      .filter((row: any) => row.seleccionado).length;

    if (cantidadSeleccionada > cantidad) {
      this.toastr.error(
        `La AHIBA ${ahiNombre} solo permite ${cantidad} tubos. Ha seleccionado ${cantidadSeleccionada}.`,
        'Error', { timeOut: 3000 }
      );
      this.ahibaSeleccionado = 0;
      return;
    }

    this.cantidadRequerida = cantidadSeleccionada;

    this.seleccionadosActuales = 0;
    this.posiciones = Array.from({ length: cantidad }, (_, i) => ({
      numero: i + 1,
      seleccionado: false,
      ocupado: false
    }));

    if (this.cantidadRequerida == 0) {
      this.toastr.warning('Seleccione al menos un item', 'Advertencia', {
        timeOut: 3000
      });
      this.ahibaSeleccionado = 0;
      return;
    }

    

    const tipos = [...new Set(seleccionadas.map((row: any) => row.tip_Ten))];
    if (tipos.length > 1) {
      this.toastr.warning(
        `Existen múltiples tipos de tenido seleccionados`,
        'Advertencia', { timeOut: 3000 }
      );
      this.ahibaSeleccionado = 0;
      return;
    }

    console.log(':::::::::::::::::::', seleccionadas);
    this.seleccionadasModal = seleccionadas.map((item: any) => ({
      ...item,
      tubo: ''
    }));

    this.listarDosificacionesXAhiba(this.ahibaSeleccionado);

    this.dialog.open(this.modalPosiciones, {
      width: '900px',
      height: '585px'
    });
  }



  toggleSeleccion(pos: any): void {

    if (pos.seleccionado) {
      pos.seleccionado = false;
      this.seleccionadosActuales = this.posiciones.filter(p => p.seleccionado).length;

      const index = this.seleccionadasModal.findIndex(i => i.tubo === pos.numero);
      if (index !== -1) {
        this.seleccionadasModal[index].tubo = '';
      }
      return;
    }

    if (this.seleccionadosActuales >= this.cantidadRequerida) {
      this.toastr.warning('Ya alcanzó la cantidad requerida de tubos');
      return;
    }

    pos.seleccionado = true;
    this.seleccionadosActuales = this.posiciones.filter(p => p.seleccionado).length;

    if (this.seleccionadosActuales <= this.seleccionadasModal.length) {
      this.seleccionadasModal[this.seleccionadosActuales - 1].tubo = pos.numero;
    }
  }

  getTransform(index: number, total: number): string {
    const step = 360 / total;
    const angle = step * (index + 1) - 90;
    const radius = 220;

    return `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`;
  }

  onCancelar(): void {
    this.ahibaSeleccionado = 0;
    this.dialog.closeAll();
  }

  limpiarSeleccion(): void {

    this.posiciones.forEach(p => p.seleccionado = false);

    this.seleccionadosActuales = 0;

    this.seleccionadasModal.forEach(item => item.tubo = '');
  }


  tubos: { numero: number, ocupado: boolean }[] = [];
  dataListadoDosificaciones: any[] = [];
  tituloCurva: string = '';

  listarDosificacionesXAhiba(Ahi_Id: number): void {
    this.SpinnerService.show();
    this.dataListadoDosificaciones = [];
    this.LabColTrabajoService.getListarItemsEnAhiba(Ahi_Id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.dataListadoDosificaciones = response.elements as any[];
          // this.dataSource.data = this.dataListadoDosificaciones;
          // this.dataSource.sort = this.sort;

          this.posiciones.forEach(p => p.ocupado = false);
          
          const tubosUnicos = Array.from(
            new Set(
              this.dataListadoDosificaciones
                .filter(item => 
                        (item.nro_Tubo && item.nro_Tubo > 0))// ||
                        //(item.nro_Tubo_Jab && item.nro_Tubo_Jab > 0))
                //.map(item => item.nro_Tubo || item.nro_Tubo_Jab)
                .map(item => item.nro_Tubo)
            )
          );

          tubosUnicos.forEach(nro => {
            const pos = this.posiciones.find(p => p.numero === nro);
            if (pos) pos.ocupado = true;
          });

          this.SpinnerService.hide();
        } else {
          this.dataListadoDosificaciones = [];
        }
      },
      error: (error: any) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', { timeout: 2500 });
      }
    });
  }


  patchActualizarEstadoDeColorTricomia(row: any): void {
    let Corr_Carta: string = row.corr_Carta;
    let Sec: number = row.sec;
    let Correlativo: number = row.correlativo;
    let Tip_Ten: string = row.tip_Ten;
    const data = {
      corr_Carta: Corr_Carta,
      sec: Sec,
      correlativo: Correlativo,
      tip_Ten: Tip_Ten
      //flg_Est_Lab: '05'
    }

    //console.log('la data para reenviar es:::::::::::::::::::::....', data);

    this.LabColTrabajoService.patchActualizarEstadoDeColorTricomia(data).subscribe({
      next: (response: any) => {
        this.onListarJabonado(this.Usuario);
      },
      error: (error: any) => {

      }
    });
  }


  toggleAllRows(checked: boolean): void {
    this.dataSource.data.forEach((row: any) => row.seleccionado = checked);
  }


  isAllSelected(): boolean {
    return this.dataSource.data.every((row: any) => row.seleccionado);
  }

  isIndeterminate(): boolean {
    const selected = this.dataSource.data.filter((row: any) => row.seleccionado);
    return selected.length > 0 && selected.length < this.dataSource.data.length;
  }


  async cargarAAHIBA(): Promise<void> {

    if(this.cantidadRequerida - this.seleccionadosActuales > 0){
      this.toastr.warning('Pendientes por asignar: ' + (this.cantidadRequerida - this.seleccionadosActuales).toString());
      return;
    }    

    const seleccionados = this.posiciones
      .filter(p => p.seleccionado)
      .map(p => p.numero);
    const seleccionadas = this.dataSource.data.filter((row: any) => row.seleccionado);

    if (seleccionados.length === 0) {
      console.log('No hay tubos seleccionados');
      return;
    }

    if (seleccionadas.length === 0) {
      console.log('No hay elementos seleccionados');
      return;
    }

    const tipTenSet = new Set(seleccionadas.map((row: any) => row.tip_Ten));
    if (tipTenSet.size > 1) {
      this.toastr.error('Combinación Inválida', '', { timeOut: 3000 });
      return;
    }


    const confirmacion = await Swal.fire({
      title: '¿Cargar a Ahiba?',
      html: `Se cargarán a la AHIBA #${this.ahibaSeleccionado}<br><br>Fecha de carga: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });

    if (!confirmacion.isConfirmed) return;

    this.SpinnerService.show();

    try {
      for (let i = 0; i < seleccionadas.length; i++) {
        const item = seleccionadas[i];
        const tubo = seleccionados[i];
        // console.log('el tubito es:------------', tubo);
        const dataEnviar = {
          corr_Carta: item.corr_Carta,
          sec: item.sec,
          correlativo: item.correlativo,
          ahi_Id: this.ahibaSeleccionado,
          nro_Tubo: tubo,
          tip_Carga: 'J',
          tip_Ten: item.tip_Ten
        };

        try {
          const respuesta: any = await this.LabColTrabajoService.patchCargarAahiba(dataEnviar).toPromise();
          if (respuesta?.message === 'AHIBA LLENA') {
            this.toastr.warning(respuesta.message, '', { timeOut: 3000 });
            break;
          }

          this.toastr.success(respuesta.message || 'Cargado correctamente', '', { timeOut: 2000 });
        } catch (error) {
          this.toastr.error('Error al cargar en AHIBA');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (this.filtroSeleccionado === 'pendientes') {
        this.onListarJabonado(this.Usuario);
      }

    } finally {
      this.ahibaSeleccionado = 0;
      this.dialog.closeAll();
      this.SpinnerService.hide();
      this.onListarJabonado(this.Usuario);
    }
  }

  onListarJabonadoExcluidoDescarga(Usr_Cod: string): void {
    this.SpinnerService.show();
    this.LabColTrabajoService.getListarJabonadoExcluidoDescarga(Usr_Cod).subscribe({
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
              ph_Jab: phArray,
              fijadoSeleccionado: item.tip_Fij,
              //fijado: item.fijado
            };
          });
          console.log(':::::::::::::::::::::.', this.dataListadoJabonado);
          this.dataSource.data = this.dataListadoJabonado;
          this.dataSource.sort = this.sort;

          this.columnsToDisplay = [
            'corr_Carta',
            'sec',
            'correlativo',
            'descripcion_Color',
            'curva_tenido',
            'dosificacion1',
            'dosificacion2',
            'dosificacion3',
            'sod_gr',
            'phIni',
            'phFin',
            'jab_Des',            
            'ph_Neu',
            'can_Jabo',
            ...this.getPhColumns(),
            'descarga',
            'tipo_fijado_descarga',
            'ph_Des'
          ];

          this.SpinnerService.hide();
        }
      },
      error: (error: any) => {

      }
    });
  }


}
