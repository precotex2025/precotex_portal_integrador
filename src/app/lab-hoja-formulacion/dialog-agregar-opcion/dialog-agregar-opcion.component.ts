import { Component, OnInit, Optional, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Console } from 'console';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';


interface data {
  Title: string,
  Num_SDC: any,
  Num_Sec: number,
  Correlativo: number,
  CorrelativoAnterior?: number,
  PartidasAgrupadasR?: string,
  TipoReceta: string
}

interface ColoranteCompleto {
  // Identificador del colorante
  Corr_Carta: string;
  Sec: string;
  Procedencia: string;
  Correlativo: number;
  Col_Cod: string;
  Por_Ini: string;
  Por_Aju: string;
  Por_Fin: string;
  Can_Jabo: number;
  Cur_Jabo: number;
  Fijado: number;
  Rel_Ban: string;
  Pes_Mue: string;
  Volumen: string;
  //Acidulado: string;
  Car_Gr: string;
  Car_Por: string;
  Sod_Gr: string;
  Sod_Por: string;
}

interface Datos {
  relacionBano: number;
  pesoMuestra: number;
  volumen: number;
}

interface Antireductores{
  nombre: string,
  cantidad: number,
  porcentaje: number
}


@Component({
  selector: 'app-dialog-agregar-opcion',
  templateUrl: './dialog-agregar-opcion.component.html',
  styleUrl: './dialog-agregar-opcion.component.scss'
})
export class DialogAgregarOpcionComponent implements OnInit, AfterViewInit {
  correlativo: number = 0;

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('inputColorante') inputColorante!: ElementRef<HTMLInputElement>;

  colorantesDisponibles: { codigo: string, nombre: string, inicial: number }[] = [];
  curvas: { nombre: string, codigo: number, cantidad: number }[] = [];
  fijados: { nombre: string, codigo: number }[] = [];
  productos: { nombre: string, cantidad: number, porcentaje: number }[] = [];
  tiposFormulacion: { nombre: string, codigo: string }[] = [];
  coloranteSeleccionado: any = null;
  correlativoAnterior: number = 0;
  colorantesSeleccionados: any[] = [];
  curvasTenido: { nombre: string, codigo: number }[] = [];
  curvaTenido: number = 0;
  TipoTenido: {nombre: string, codigo: string}[] = [];
  TipoTenidoSeleccionado: string = '';
  //antireductores: {nombre: string, cantidad: number, porcentaje: number}[] = [];
  //antiReductores: Array<Antireductores> = [];
  antiReductorCantidad: number = 1.0;
  antiReductorPorcentaje: number = 0;
  baseAntireductor: number = 0;
  cantidadLavados: number = 0;
  aguaOxigenadaCantidad: number = 2.0;
  aguaOxigenadaPorcentaje: number = 0;
  baseAguaOxigenada: number = 2.0;
  sodaCausticaCantidad: number = 2.0;
  sodaCausticaPorcentaje: number = 0;
  baseSodaCaustica: number = 2.0;

  rucolaseCantidad = [
    { codigo: 0.2, nombre: '0.2' },
    { codigo: 0.3, nombre: '0.3' },
    { codigo: 0.5, nombre: '0.5' }
  ];

  rucolaseCantidadSeleccionada: number = 0.3;

  parametros = {
    jabonadas: 0,
    curva: 0,
    fijado: 0,
    tiposFormulacion: ''
  };

  // datos = {
  //   relacionBano: 8,
  //   pesoMuestra: 10,
  //   volumen: 80
  // };

  datos: Datos = {
    relacionBano: 0,
    pesoMuestra: 0,
    volumen: 0
  };


  cambiosHabilitados = false;
  estadoCambio = 0;

  constructor(
    private SpinnerService: NgxSpinnerService,
    private LabColTraService: LabColTrabajoService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    // public dialogRef: MatDialogRef<DialogAgregarOpcionComponent>
  ) { }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.inputColorante.nativeElement.focus();
    // }, 100);
  }
  coloranteControl = new FormControl('');
  colorantesFiltrados: any[] = [];
  Familia: string = '';
  esPartida: boolean = true;
  ngOnInit(): void {
    this.onGetParams();
  }

  cargando = true;
  onGetParams(): void {
    this.route.queryParams.subscribe(params => {
      this.data = {
        Title: params['accionR'] ?? '',
        Num_SDC: params['Num_SDC'] !== undefined ? String(params['Num_SDC']) : '',
        Num_Sec: params['Num_Sec'] !== undefined ? Number(params['Num_Sec']) : 0,
        Correlativo: params['Correlativo'] !== undefined ? Number(params['Correlativo']) : 0,
        CorrelativoAnterior: params['CorrelativoAnterior'] !== undefined ? Number(params['CorrelativoAnterior']) : 0,
        PartidasAgrupadasR: params['PartidasAgrupadasE'] !== undefined ? String(params['PartidasAgrupadasE']) : '',
        TipoReceta: params['TipoReceta'] !== undefined ? String(params['TipoReceta']) : ''
      };
    })

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>', this.data.TipoReceta);

    this.TipoTenidoSeleccionado = this.data.TipoReceta;

    const empiezaConLetra = /^[A-Za-z]/.test(this.data.Num_SDC);
    this.esPartida = empiezaConLetra;
    
    this.correlativo = this.data.Correlativo;
    //console.log('::::::::::::::::::::::', this.data);
    this.coloranteControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this.filtrarColorantes(value) : this.filtrarColorantes(''))
    ).subscribe(filtrados => {
      this.colorantesFiltrados = filtrados;
    });
    this.GetFamiliasProceso();
    this.getObtenerTrio(this.data.Num_SDC, this.data.Num_Sec, this.data.TipoReceta);
    this.GetColorantes();
    this.GetCurvasJabonado();
    this.GetFijados();
    this.getObtenerFamiliaDesdeCabecera(this.data.Num_SDC, this.data.Num_Sec);
    this.getObtenerCurvaReactivoDisperso(this.data.Num_SDC, this.data.Num_Sec, this.data.TipoReceta);
    this.quitarFocus();
    if (this.data.Title === 'Copiar') {
      //console.log('Cargando datos para modificar...');
      this.correlativoAnterior = this.data.CorrelativoAnterior!;
      console.log('TIPO RECETA EN COPIAR',this.data.TipoReceta);
      this.cargarDatosParaModificar(this.data.Num_SDC, this.data.Num_Sec, this.data.CorrelativoAnterior || 0, this.data.TipoReceta);
      setTimeout(() => this.cargando = false, 0);
      //this.actualizarTotalFinal();
    } else if (this.data.Title === 'Insertar') {
      this.correlativo += 1;
    }

    setTimeout(() => this.quitarFocus(), 100);
  }

  quitarFocus(): void {
    this.inputColorante?.nativeElement?.blur();
  }

  filtrarColorantes(valor: string): any[] {
    const filtro = valor.toLowerCase();
    return this.colorantesDisponibles.filter(c =>
      c.nombre.toLowerCase().includes(filtro) || c.codigo.toLowerCase().includes(filtro)
    );
  }

  

  getDatosRelBanPesMueVol(): void {
    if (!this.esPartida) {
      this.datos.relacionBano = 8;
      this.datos.pesoMuestra = 10;
      this.datos.volumen = 80;
    } else {
      this.datos.relacionBano = 8;
      this.datos.pesoMuestra = 10;
      this.datos.volumen = 80;
    }
  }



  onColoranteSeleccionado(event: MatAutocompleteSelectedEvent): void {
    let familia
    familia = this.parametros.tiposFormulacion.toString();

    if (!familia) {
      this.toastr.warning('Debe seleccionar un Proceso', '', { timeOut: 2500 });
      return;
    }
    const colorante = event.option.value;
    this.coloranteSeleccionado = colorante;

    this.colorantesSeleccionados.push({
      codigo: colorante.codigo,
      nombre: colorante.nombre,
      inicial: null, //parseFloat(colorante.inicial.toFixed(5)),
      ajuste: 0 //0
    });

    //this.coloranteControl.setValue('');
    this.coloranteSeleccionado = null;

    this.colorantesFiltrados = this.filtrarColorantes('');

    //this.actualizarTotalFinal();
  }

  mostrarNombre(colorante: any): string {
    //return colorante?.nombre || '';
    return '';
  }

  ajustar(colorante: any, delta: number): void {
    colorante.ajuste = parseFloat((colorante.ajuste + delta).toFixed(2));
  }

  // calcularFinal(colorante: any): number {
  //   return Math.max(0, parseFloat((colorante.inicial + (colorante.inicial * colorante.ajuste) / 100).toFixed(5)));
  // }

  totalFinalColorantes: number = 0;
  condicion: number = 0;

  actualizarTotalFinal(): void {
    this.Familia = this.parametros.tiposFormulacion.toString();
    this.colorantesSeleccionados.forEach(c => {
      c.inicial = parseFloat(c.inicial) || 0;
    });

    this.totalFinalColorantes = this.colorantesSeleccionados
      .map(c => this.calcularFinal(c))
      .reduce((acc, val) => acc + val, 0);

    
    const contieneAMAVBTES = this.colorantesSeleccionados.some(c => c.codigo === 'QC000472');

    if (contieneAMAVBTES) {
      this.condicion = 1;
    }

    // let familia: string = '';
    // if(this.TipoTenidoSeleccionado === 'D'){
    //   familia = '132.00000'
    // }else{
    //   familia = this.Familia
    // }
    
    console.log('::::::::::::::::::::::.', this.Familia);
    console.log(this.totalFinalColorantes);
    console.log(this.condicion);
    console.log(this.data.TipoReceta);
    this.GetCarbonatoSodaCalculado(this.totalFinalColorantes, this.Familia, this.condicion, this.data.TipoReceta);
    this.GetCurvasJabonadoCalculado(this.totalFinalColorantes, this.Familia, this.data.TipoReceta);
    this.GetFijadosCalculado(this.totalFinalColorantes, this.Familia, this.data.TipoReceta);
    this.getListarCurvas(this.Familia);
    this.getListarTiposTenido(this.Familia);
  }

  actualizarTotalFinalDesdeCopiar(Familia: string): void {

    this.colorantesSeleccionados.forEach(c => {
      c.inicial = parseFloat(c.inicial.toFixed(5));
    });

    this.totalFinalColorantes = this.colorantesSeleccionados
      .map(c => this.calcularFinal(c))
      .reduce((acc, val) => acc + val, 0);

    const contieneAMAVBTES = this.colorantesSeleccionados.some(c => c.codigo === 'QC000472');

    if (contieneAMAVBTES) {
      this.condicion = 1;
    }

    this.actualizarTotalFinal();
  }

  limitarDecimales(colorante: any): void {
    //colorante.inicial = parseFloat(colorante.inicial.toFixed(5));
    colorante.inicial = parseFloat(colorante.inicial);
    this.actualizarTotalFinal();
  }

  habilitarCambios(): void {
    if (this.cambiosHabilitados === false) {
      this.cambiosHabilitados = true;
      this.estadoCambio = 1;
    } else {
      this.cambiosHabilitados = false;
      this.estadoCambio = 0;
    }
    console.log('Cambios habilitados');
  }

  guardar(): void {
    this.guardarColorantesConParametros();
  }

  cerrar(): void {
    this.router.navigate(['HojaFormulacion']);
  }

  quitarColorante(colorante: any): void {
    this.colorantesSeleccionados = this.colorantesSeleccionados.filter(c => c !== colorante);
    this.actualizarTotalFinal();
  }

  actualizarCantidad(producto: any): void {
    const baseCantidad = producto.baseCantidad ?? producto.cantidad;

    if (producto.baseCantidad === undefined) {
      producto.baseCantidad = baseCantidad;
    }

    producto.cantidad = +(baseCantidad + producto.porcentaje).toFixed(2);
  }

  actualizarCantidadAntireductor(): void {

    this.antiReductorCantidad = (this.baseAntireductor + this.antiReductorPorcentaje); /// 100;

  }

  actualizarCantidadAguaOxigenada(): void {

    this.aguaOxigenadaCantidad = (this.baseAguaOxigenada + this.aguaOxigenadaPorcentaje); /// 100;

    if (this.aguaOxigenadaCantidad > 8 || this.aguaOxigenadaCantidad < 2) {
      this.aguaOxigenadaCantidad = 2.0;
      this.baseAguaOxigenada = 2.0;
      this.aguaOxigenadaPorcentaje = 0;
      this.toastr.warning('Solo se permiten valores entre 2 y 8', '', { timeOut: 2500 });
      return;
    }
  }

  actualizarCantidadSoda(): void {

    this.sodaCausticaCantidad = (this.baseSodaCaustica + this.sodaCausticaPorcentaje); /// 100;
    if (this.sodaCausticaCantidad > 8 || this.sodaCausticaCantidad < 2) {
      this.sodaCausticaCantidad = 2.0;
      this.baseSodaCaustica = 2.0;
      this.sodaCausticaPorcentaje = 0;
      this.toastr.warning('Solo se permiten valores entre 2 y 8', '', { timeOut: 2500 });
      return;
    }
  }


  // guardarColorantesConParametros(): void {
  //   if (this.colorantesSeleccionados.length === 0) {
  //     this.toastr.warning('Debe agregar al menos un colorante', '', { timeOut: 2500 });
  //     return;
  //   }

  //   const carbonato = this.productos.find(p => p.nombre.toUpperCase().includes('CARBONATO'));
  //   const soda = this.productos.find(p => p.nombre.toUpperCase().includes('SODA'));
  //   const familia = this.parametros.tiposFormulacion.toString();


  //   const comunes = {
  //     Corr_Carta: this.data?.Num_SDC?.toString() || '',
  //     Sec: this.data?.Num_Sec?.toString() || '0',
  //     Correlativo: this.correlativo,
  //     Can_Jabo: this.parametros.jabonadas.toString(),
  //     Cur_Jabo: this.parametros.curva.toString(),
  //     Fijado: this.parametros.fijado.toString(),
  //     Rel_Ban: this.datos.relacionBano.toString(),
  //     Pes_Mue: this.datos.pesoMuestra.toString(),
  //     Volumen: this.datos.volumen.toString(),
  //     // Acidulado: this.parametros.acidulado.toString(),
  //     Car_Gr: carbonato?.cantidad.toString() || '0',
  //     Car_Por: carbonato?.porcentaje.toString() || '0',
  //     Sod_Gr: soda?.cantidad.toString() || '0',
  //     Sod_Por: soda?.porcentaje.toString() || '0',
  //     Familia: familia,
  //     Cambio: this.estadoCambio
  //   };

  //   let ProcedenciaHardCodeada: string = "";

  //   if (this.data.Title === 'Copiar') {
  //     ProcedenciaHardCodeada = "Copia de Corrida #" + this.data.CorrelativoAnterior?.toString();
  //   }

  //   const comunes2 = {
  //     Corr_Carta: this.data?.Num_SDC?.toString() || '',
  //     Sec: this.data?.Num_Sec?.toString() || '0',
  //     Correlativo: this.correlativo,
  //     Familia: familia,
  //     Cambio: this.estadoCambio,
  //     ProcedenciaHardCodeada: ProcedenciaHardCodeada
  //   };
  //   this.SpinnerService.show();

  //   let pendientes = this.colorantesSeleccionados.length;
  //   let errores = 0;

  //   this.colorantesSeleccionados.forEach((c, index) => {
      
  //     let datitos
  //     if (this.data.Title === 'Copiar') {
  //       datitos = {
  //         ...comunes,
  //         Col_Cod: c.codigo,
  //         Procedencia: "Opcion Agregada",
  //         Por_Ini: c.inicial.toFixed(5),
  //         Por_Aju: c.ajuste,
  //         Por_Fin: c.final
  //       };
  //     } else {
  //       datitos = {
  //         ...comunes,
  //         Col_Cod: c.codigo,
  //         Procedencia: "Opcion Agregada",
  //         Por_Ini: c.inicial.toFixed(5),
  //         Por_Aju: c.ajuste,
  //         Por_Fin: this.calcularFinal(c).toFixed(5)
  //       };
  //     }
      
  //     //console.log('::::::::::::::::::::::::::.', comunes)
  //     //console.log('::::::::::::::::::::::::::::::.', comunes2)
  //     //console.log(':::::::::::::::::::::::::::::::::::.', datitos)
      
  //     this.LabColTraService.postAgregarOpcionColorante(datitos).subscribe({
  //       next: (response: any) => {
  //         if (!response.success) errores++;
  //         pendientes--;
  //         if (pendientes === 0) {
  //           this.finalizarGuardado(errores)
  //           this.guardarAuxiliares(comunes2);
  //         };
  //       },
  //       error: () => {
  //         errores++;
  //         pendientes--;
  //         if (pendientes === 0) {
  //           this.finalizarGuardado(errores);
  //         }
  //       }
  //     });
  //   });
  // }

  async guardarColorantesConParametros(): Promise<void> {
    if (this.colorantesSeleccionados.length === 0) {
      this.toastr.warning('Debe agregar al menos un colorante', '', { timeOut: 2500 });
      return;
    }

    const carbonato = this.productos.find(p => p.nombre.toUpperCase().includes('CARBONATO'));
    const soda = this.productos.find(p => p.nombre.toUpperCase().includes('SODA'));

    let familiaPrincipal: string = '';
    let canJaboPrincipal: string = '';

    if(this.TipoTenidoSeleccionado === 'D'){
      if(this.parametros.tiposFormulacion === '1.00000' || this.parametros.tiposFormulacion === '2.00000'){
        familiaPrincipal = this.Familia;
        canJaboPrincipal = '0';
      }else{
        familiaPrincipal = this.Familia;
        canJaboPrincipal = this.cantidadLavados.toString();
      }
      
    }else{
      familiaPrincipal = this.parametros.tiposFormulacion.toString();
      canJaboPrincipal = this.parametros.jabonadas.toString();
    }
    
    const familia = familiaPrincipal;
    const canJabonados = canJaboPrincipal;
    const tipo_tenido = this.TipoTenidoSeleccionado || '';
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',tipo_tenido);
    let sodaGr: string = ''

    if(familia !== '1.00000' && familia !== '2.00000'){
      sodaGr = soda?.cantidad.toString() || '0'
    }else{
      sodaGr = this.sodaCausticaCantidad.toString() || '0'
    }

    const comunes = {
      Corr_Carta: this.data?.Num_SDC?.toString() || '',
      Sec: this.data?.Num_Sec?.toString() || '0',
      Correlativo: this.correlativo,
      Can_Jabo: canJabonados || '0',
      Cur_Jabo: this.parametros.curva.toString() || '0',
      Fijado: this.parametros.fijado.toString() || '0',
      Rel_Ban: this.datos.relacionBano.toString() || '0',
      Pes_Mue: this.datos.pesoMuestra.toString() || '0',
      Volumen: this.datos.volumen.toString() || '0',
      Car_Gr: carbonato?.cantidad.toString() || '0',
      Car_Por: carbonato?.porcentaje.toString() || '0',
      // Sod_Gr: soda?.cantidad.toString() || '0',
      Sod_Gr: sodaGr,
      Sod_Por: soda?.porcentaje.toString() || '0',
      Familia: familia,
      Cambio: this.estadoCambio,
      Ant_Red: this.antiReductorCantidad || 0,
      Ant_Red_Aju: this.antiReductorPorcentaje || 0,
      Agu_Oxi: this.aguaOxigenadaCantidad || 0,
      Ruc_Gr: this.rucolaseCantidadSeleccionada || 0,
      Tip_Ten: tipo_tenido
    };

    const comunes2 = {
      Corr_Carta: this.data?.Num_SDC?.toString() || '',
      Sec: this.data?.Num_Sec?.toString() || '0',
      Correlativo: this.correlativo,
      Familia: familia,
      Cambio: this.estadoCambio,
      ProcedenciaHardCodeada: this.data.Title === 'Copiar'
        ? "Copia de Corrida #" + this.data.CorrelativoAnterior?.toString()
        : "",
      Cur_Ten: this.curvaTenido || 0,
      Tip_Ten: tipo_tenido
    };
    console.log('::::::::::::::::::::::::::::.', comunes);
    console.log(':::::::::::::::::::::::::::::::::.', comunes2);
    this.SpinnerService.show();
    let errores = 0;

    try {
      for (let i = 0; i < this.colorantesSeleccionados.length; i++) {
        const c = this.colorantesSeleccionados[i];

        const datitos = {
          ...comunes,
          Col_Cod: c.codigo,
          Procedencia: "Opcion Agregada",
          Por_Ini: c.inicial.toFixed(5),
          Por_Aju: c.ajuste,
          Por_Fin: this.data.Title === 'Copiar'
            ? c.final
            : this.calcularFinal(c).toFixed(5)
        };

        try {
          const response: any = await this.LabColTraService.postAgregarOpcionColorante(datitos).toPromise();
          if (!response.success) errores++;
        } catch {
          errores++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.finalizarGuardado(errores);
      this.guardarAuxiliares(comunes2);

    } finally {
      this.SpinnerService.hide();
    }
  }




  finalizarGuardado(errores: number): void {
    this.SpinnerService.hide();
    if (errores === 0) {
      this.toastr.success('Todos los colorantes fueron guardados correctamente', '', { timeOut: 2500 });
    } else {
      this.toastr.warning(`Se guardaron con ${errores} error(es)`, '', { timeOut: 3000 });
    }
  }

  guardarAuxiliares(comunes2: any): void {
    this.LabColTraService.postAgregarAuxiliaresHojaFormulacion(comunes2).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('Auxiliares guardados correctamente');
        }
      }
    });
  }


  colorantes = [];
  GetColorantes(): void {
    this.SpinnerService.show();
    this.colorantes = [];
    this.LabColTraService.getListarColorantesAgregarOpcion().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.colorantesDisponibles = response.elements.map((c: any) => ({
              codigo: c.col_Cod_Org,
              nombre: c.col_Des,
              inicial: c.col_Ini
            }));

            this.coloranteControl.valueChanges.pipe(
              startWith(''),
              map(value => typeof value === 'string' ? this.filtrarColorantes(value) : this.filtrarColorantes(''))
            ).subscribe(filtrados => {
              this.colorantesFiltrados = filtrados;
            });

            this.colorantesFiltrados = this.colorantesDisponibles;

            this.SpinnerService.hide();
          } else {
            this.colorantes = [];
            this.SpinnerService.hide();
          }
        } else {
          this.colorantes = [];
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

  GetCurvasJabonado(): void {
    this.SpinnerService.show();
    this.curvas = [];
    this.LabColTraService.getListarJabonados().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.curvas = response.elements.map((c: any) => ({
              codigo: c.jab_Id,
              nombre: c.jab_Des
            }));
            this.SpinnerService.hide();
          } else {
            this.curvas = [];
            this.SpinnerService.hide();
          }
        } else {
          this.curvas = [];
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

  GetCurvasJabonadoCalculado(Colorante_Total: number, Familia: string, Tipo: string): void {
    this.SpinnerService.show();
    this.curvas = [];
    this.LabColTraService.getListarJabonadosCalculado(Colorante_Total, Familia, Tipo).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            console.log('los elementos jabonados calculados son: ', response.elements);
            this.curvas = response.elements.map((c: any) => ({
              codigo: c.jab_Id,
              nombre: c.jab_Des,
              cantidad: c.jab_Can
            }));

            this.parametros.curva = this.curvas[0]?.codigo || 0;
            this.parametros.jabonadas = this.curvas[0]?.cantidad || 0;

            if(this.TipoTenidoSeleccionado === 'D'){
              this.cantidadLavados = this.parametros.jabonadas;
            }

            this.SpinnerService.hide();
          } else {
            this.curvas = [];
            this.SpinnerService.hide();
          }
        } else {
          this.curvas = [];
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


  GetFijados(): void {
    this.SpinnerService.show();
    this.fijados = [];
    this.LabColTraService.getListarFijados().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.fijados = response.elements.map((c: any) => ({
              codigo: c.fij_Id,
              nombre: c.fij_Des
            }));

            this.SpinnerService.hide();
          } else {
            this.fijados = [];
            this.SpinnerService.hide();
          }
        } else {
          this.fijados = [];
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

  GetFijadosCalculado(Colorante_Total: number, Familia: string, Tipo: string): void {
    this.SpinnerService.show();
    this.fijados = [];
    this.LabColTraService.getListarFijadosCalculado(Colorante_Total, Familia, Tipo).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('los elementos fijados calculados son: ', response.elements);
          if (response.totalElements > 0) {
            this.fijados = response.elements.map((c: any) => ({
              codigo: c.fij_Id,
              nombre: c.fij_Des
            }));

            this.parametros.fijado = this.fijados[0]?.codigo || 0;
            console.log('El valor en parametros fijado es: ', this.parametros.fijado);
            this.SpinnerService.hide();
          } else {
            this.fijados = [];
            this.SpinnerService.hide();
          }
        } else {
          this.fijados = [];
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

  GetCarbonatoSodaCalculado(Colorante_Total: number, Familia: string, Com_Cod_Con: number, Tipo: string): void {
    this.SpinnerService.show();
    this.productos = [];

    this.LabColTraService.getListarCarbonatoSodaCalculado(Colorante_Total, Familia, Com_Cod_Con, Tipo).subscribe({
      next: (response: any) => {
        if (response.success) {

          if (response.totalElements > 0) {

            const datos = response.elements[0];
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>><', datos);
            this.productos = [];

            if (datos.com_Cod_Extra6 === 'CO3') {
              this.productos.push({
                nombre: 'CARBONATO',
                cantidad: datos.com_Can_Extra6,
                porcentaje: 0
              });
            }

            if (datos.com_Cod_Extra7 === 'SODA') {
              this.productos.push({
                nombre: 'SODA',
                cantidad: datos.com_Can_Extra7,
                porcentaje: 0
              });
            }

            this.SpinnerService.hide();
          } else {
            this.productos = [];
            this.SpinnerService.hide();
          }
        } else {
          this.productos = [];
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

  GetFamiliasProceso(): void {
    this.tiposFormulacion = [];
    this.LabColTraService.getListarFamiliasProceso().subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.tiposFormulacion = response.elements.map((c: any) => ({
              codigo: c.pro_Cod,
              nombre: c.pro_Des
            }));
          } else {
            this.tiposFormulacion = [];
          }
        } else {
          this.tiposFormulacion = [];
        }
      },
      error: (error: any) => {
        console.log(error.error.message, 'Cerrar', {
          timeout: 2500
        })
      }
    })
  }

  datosParaModificar: any = [];

  cargarDatosParaModificar(Corr_Carta: any, Sec: number, Correlativo: number, Tip_Ten: string): void {
    this.datosParaModificar = [];

    this.LabColTraService.getCargarColoranteParaCopiar(Corr_Carta, Sec, Correlativo, Tip_Ten).subscribe({
      next: (response: any) => {
        const datos = response.elements?.[0];
        console.log('los datos extraidos son: ', datos);
        if (!datos) {
          this.toastr.warning('No se encontraron datos para modificar');
          return;
        }
        this.productos = [
          {
            nombre: 'CARBONATO',
            cantidad: datos.car_Gr ?? 0,
            porcentaje: datos.car_Por ?? 0
          },
          {
            nombre: 'SODA',
            cantidad: datos.sod_Gr ?? 0,
            porcentaje: datos.sod_Por ?? 0
          }
        ];

        this.TipoTenidoSeleccionado = datos.tip_Ten;
        
        this.curvaTenido = datos?.cur_Ten.toString();

        //console.log('Productos cargados: ', this.productos);
        this.colorantesSeleccionados = (datos.colorantes ?? []).map((c: any) => ({
          codigo: c.col_Cod,
          nombre: c.col_Des,
          inicial: c.por_Fin ? parseFloat(c.por_Fin.toFixed(5)) : 0,
          ajuste: 0,
          final:  c.por_Fin ? parseFloat(c.por_Fin.toFixed(5)) : 0,
          id_secuencia: c.id_secuencia
        }));

        this.colorantesSeleccionados.sort((a, b) => a.id_secuencia - b.id_secuencia);


        let tipoFamilia: string = datos.familia.toString();
        let jabonadoNormal: number = 0;
        let jabonadoLavado : number = 0;
        if (this.TipoTenidoSeleccionado === 'D')
        {
          jabonadoNormal = 0;
          jabonadoLavado = datos.can_Jabo ?? 0;
        }else{
          jabonadoLavado = 0;
          jabonadoNormal= datos.can_Jabo ?? 0;
        }

        this.parametros = {
          jabonadas: jabonadoNormal,
          curva: parseInt(datos.cur_Jabo) ?? 0,
          fijado: parseInt(datos.fijado) ?? 0,
          //tiposFormulacion: datos.familia ?? ''
          tiposFormulacion: tipoFamilia ?? ''
        };

        console.log(this.parametros);

        const peso = datos.pes_Mue ?? 0;
        const relacion = Number(datos.rel_Ban ?? 0);
        const antiReductorCantidad = datos.ant_Red ?? 0;
        const antiReductorPorcentaje = datos.ant_Red_Aju ?? 0;
        const rucolaseCantidadSeleccionada = datos.ruc_Gr ?? 0;
        const cantidadLavados = jabonadoLavado;
        this.datos = {
          relacionBano: relacion,
          pesoMuestra: peso,
          volumen: relacion * peso
        };

        this.antiReductorCantidad = antiReductorCantidad;
        this.antiReductorPorcentaje = antiReductorPorcentaje;
        this.rucolaseCantidadSeleccionada = rucolaseCantidadSeleccionada;
        this.cantidadLavados = cantidadLavados;
        console.log('::::::::::::::::::::::::::::::::::::::.', this.datos);
        
        this.getListarTiposTenido(datos.familia.toString());
        this.getListarCurvas(datos.familia.toString());
        this.actualizarTotalFinalDesdeCopiar(datos.familia.toString());

      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al cargar datos para modificar';
        this.toastr.error(msg);
      }
    });
  }

  calcularRelacionBano(): void {
    const peso = this.datos.pesoMuestra;
    const volumen = this.datos.volumen;

    if (peso && volumen && peso > 0) {
      this.datos.relacionBano = +(volumen / peso).toFixed(2);
    } else {
      this.datos.relacionBano = 0;
    }
  }

  getObtenerTrio(Corr_Carta: any, Sec: number, Tip_Ten: string) {
    this.LabColTraService.getObtenerTrio(Corr_Carta, Sec, Tip_Ten).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.datos.relacionBano = response.elements[0].rel_Ban;
          this.datos.pesoMuestra = response.elements[0].pes_Mue;
          this.datos.volumen = response.elements[0].volumen;
          //this.parametros.tiposFormulacion = response.elements[0].familia;
        }
      },
      error: (error: any) => {

      }
    });
  }

  guardarColorantesConParametrosPromise(dataCopia: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const backup = { ...this.data };
      this.data = dataCopia;

      this.guardarColorantesConParametros();

      const originalFinalizar = this.finalizarGuardado.bind(this);
      this.finalizarGuardado = (errores: number) => {
        originalFinalizar(errores);
        this.data = backup;
        this.SpinnerService.hide();
        resolve();
      };
    });
  }

  async ejecutarPorPartidasAgrupadasSecuencial(): Promise<void> {
    const algunCeroInicial = this.colorantesSeleccionados.some(c => !c.inicial || c.inicial === 0);
    const algunCeroFinal = this.colorantesSeleccionados.some(c => !c.final || c.final === 0);
    if(this.data.Title === 'Insertar'){
      if (algunCeroInicial) {
        this.toastr.warning('El porcentaje inicial no puede ser cero', 'Alerta', {
          timeOut: 2500
        });
        return;
      }  
    }else{
      if (algunCeroFinal) {
        this.toastr.warning('El porcentaje final no puede ser cero', 'Alerta', {
          timeOut: 2500
        });
        return;
      }
    }
    
    
    try {
      if (!this.data.PartidasAgrupadasR) {
        this.guardar();
      } else {
        const partidas = this.data.PartidasAgrupadasR!.split('/')
          .map(p => p.trim())
          .filter(p => p.length > 0);

        const backup = { ...this.data };

        for (const partida of partidas) {
          const dataCopia = { ...backup, Num_SDC: partida };
          console.log('Registrando partida secuencial:', partida);

          await this.guardarColorantesConParametrosPromise(dataCopia);
        }

        this.data = backup;
      }
    } finally {
      this.router.navigate(['HojaFormulacion']);
    }
  }

  // actualizarDesdeFinal(colorante: any): void {
  //   const final = Number(colorante.final) || 0;
  //   const ajuste = Number(colorante.ajuste) || 0;

  //   colorante.inicial = final / (1 + ajuste / 100);

  //   this.actualizarTotalFinal();
  // }

  // actualizarDesdeFinal(colorante: any): void {
  //   const final = Number(colorante.final) || 0;
  //   const inicial = Number(colorante.inicial) || 0;

  //   if (inicial !== 0) {
  //     colorante.ajuste = ((final - inicial) / inicial) * 100;
  //   } else {
  //     colorante.ajuste = 0;
  //   }

  //   this.actualizarTotalFinal();
  // }


  // calcularFinal(colorante: any): number {
  //   console.log(':::::::::::::::::::.', colorante);
  //   return Math.max(
  //     0,
  //     parseFloat(
  //       (colorante.inicial + (colorante.inicial * colorante.ajuste) / 100).toFixed(5)
  //     )
  //   );
  // }
  
  calcularFinal(colorante: any): number {
    const final = parseFloat(colorante.final);

    // Si final no existe o es NaN, devolver 0
    if (isNaN(final)) {
      return 0;
    }

    return Math.max(0, parseFloat(final.toFixed(5)));
  }


  // actualizarFinal(colorante: any): void {
  //   console.log(':::::::::::::::::::::::::::::::::::::::::.', colorante);
  //   colorante.final = this.calcularFinal(colorante);
  //   this.actualizarTotalFinal();
  // }

  actualizarFinal(colorante: any) {
  const inicial = parseFloat(colorante.inicial) || 0;
  const ajuste = parseFloat(colorante.ajuste) || 0;

  colorante.final = (inicial + (inicial * ajuste) / 100).toFixed(5);
  this.actualizarTotalFinal();
  }

  actualizarDesdeFinal(colorante: any) {
    const inicial = parseFloat(colorante.inicial) || 0;
    const final = parseFloat(colorante.final) || 0;

    if (inicial !== 0) {
      if(final > 0){
        colorante.ajuste = (((final - inicial) * 100) / inicial).toFixed(2);
      }else{
        colorante.ajuste = 0;
      }
      
    } else {
      colorante.ajuste = 0;
    }

    this.actualizarTotalFinal();
  }


  validarNumero(event: KeyboardEvent) {
    const char = event.key;
    if (!/[0-9.]/.test(char)) {
      event.preventDefault();
    }
  }

  // formatearDosDecimales(colorante: any) {
  //   if (colorante.ajuste !== null && colorante.ajuste !== undefined) {
  //     colorante.ajuste = parseFloat(colorante.ajuste);
  //   }
  // }


  getObtenerFamiliaDesdeCabecera(Corr_Carta: string, Sec: number): void {
    let familia: string = '';
    this.LabColTraService.getObtenerFamiliaDesdeCabecera(Corr_Carta, Sec).subscribe({
      next: (response: any) => {
        if(response.success){
          familia = response.elements[0].familia;
          console.log(familia);
          this.parametros.tiposFormulacion = familia;
          this.getListarTiposTenido(familia.toString());
          this.getListarCurvas(familia.toString());
        }
      }
    });
  }

  getListarCurvas(Pro_Cod: string): void {
    this.LabColTraService.getListarCurvas(Pro_Cod).subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0) {
            this.curvasTenido = response.elements.map((c: any) => ({
              codigo: c.codigo,
              nombre: c.descripcion
            }));
          }
        }
      },
      error: (error: any) => {}
    });
  }

  getListarTiposTenido(Familia: string): void {
    //Familia = this.FamiliaReferencia;
    this.LabColTraService.getListarTiposTenido(Familia).subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            console.log('::::::::::::::..', response.elements);
            this.TipoTenido = response.elements.map((t: any) => ({
              codigo: t.tip_Ten_Acr,
              nombre: t.tip_Ten_Des
            }));
          }
        }
      },
      error: (error: any) => {}
    }); 
  }

  // BuscarReactivo(): void {
  //   this.TipoTenidoSeleccionado = 'D';
  // }

  // BuscarDisperso(): void {
  //   this.TipoTenidoSeleccionado = 'R';
  // }

  SeleccionarTipoTenido(event: MatSelectChange): void {
    this.TipoTenidoSeleccionado = event.value;
    // let tipoTenido: string = '';
    console.log('TIPO DE TENIDO SELECCIONADO----------', this.TipoTenidoSeleccionado);     
    this.getObtenerUltimoCorrelativoXTipoTenido(this.data.Num_SDC, this.data.Num_Sec, this.TipoTenidoSeleccionado);
    this.getObtenerCurvaReactivoDisperso(this.data.Num_SDC, this.data.Num_Sec, this.TipoTenidoSeleccionado);
  }
  
  nuevoCorrelativo: number = 0;
  getObtenerUltimoCorrelativoXTipoTenido(Corr_Carta: string, Sec: number, Tip_Ten: string): void {
    this.LabColTraService.getObtenerUltimoCorrelativoXTipoTenido(Corr_Carta, Sec, Tip_Ten).subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            this.nuevoCorrelativo = response.elements[0].correlativo;
            console.log('EL NUEVO CORRELATIVO ES:::::::::::::::::::..', this.nuevoCorrelativo);
          }
        }
      },
      error: (error: any) => {}
    });
  }

  getObtenerCurvaReactivoDisperso(Corr_Carta: string, Sec: number, Tip_Ten: string): void {
    this.LabColTraService.getObtenerCurvaReactivoDisperso(Corr_Carta, Sec, Tip_Ten).subscribe({
      next: (response: any) => {
        if(response.success){
          this.curvaTenido = response.elements[0].cur_Id
        }
      },
      error: (error: any) => {}
    });
  }


}
