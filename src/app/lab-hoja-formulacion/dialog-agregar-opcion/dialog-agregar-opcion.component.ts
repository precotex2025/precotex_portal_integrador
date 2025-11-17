import { Component, OnInit, Optional, Inject, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
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


interface data {
  Title: string,
  Num_SDC: number,
  Num_Sec: number,
  Correlativo: number
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
  Fijado  : number;
  Rel_Ban : string;
  Pes_Mue : string;
  Volumen : string;
  //Acidulado: string;
  Car_Gr  : string;
  Car_Por : string;
  Sod_Gr  : string;
  Sod_Por : string;
}


//SE QUITO EL CAMPO ACIDULADO -> FALTA ELIMINARLO DEL BACKEND Y DE LOS SP EN EL SQL

@Component({
  selector: 'app-dialog-agregar-opcion',
  templateUrl: './dialog-agregar-opcion.component.html',
  styleUrl: './dialog-agregar-opcion.component.scss'
})
export class DialogAgregarOpcionComponent implements OnInit, AfterViewInit {
  correlativo: number = 0;

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('inputColorante') inputColorante!: ElementRef<HTMLInputElement>;
  constructor(
    private SpinnerService: NgxSpinnerService,
    private LabColTraService: LabColTrabajoService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    // public dialogRef: MatDialogRef<DialogAgregarOpcionComponent>
  ){}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inputColorante.nativeElement.focus();
    }, 100);
  }
  coloranteControl = new FormControl('');
  colorantesFiltrados: any[] = [];
  Familia: string = '';
  ngOnInit(): void {
    this.onGetParams();
  }

  onGetParams(): void {
    // Inicializar los valores predeterminados para asignar los parámetros
    // this.data = {
    //   Title: '',
    //   Num_SDC: 0,
    //   Num_Sec: 0,
    //   Correlativo: 0
    // };
    
    this.route.queryParams.subscribe(params => {
      this.data = {
        Title: params['accionR'] ?? '',
        Num_SDC: params['Num_SDC'] !== undefined ? Number(params['Num_SDC']) : 0,
        Num_Sec: params['Num_Sec'] !== undefined ? Number(params['Num_Sec']) : 0,
        Correlativo: params['Correlativo'] !== undefined ? Number(params['Correlativo']) : 0
      };
    })

    this.correlativo = this.data.Correlativo + 1;
    this.coloranteControl.setValue('');

    this.coloranteControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this.filtrarColorantes(value) : this.filtrarColorantes(''))
    ).subscribe(filtrados => {
      this.colorantesFiltrados = filtrados;
    });

    this.GetColorantes();
    this.GetCurvasJabonado();
    this.GetFijados();
    this.GetFamiliasProceso();
    this.quitarFocus();
    
    if(this.data.Title === 'Copiar'){
      console.log('Cargando datos para modificar...');
      this.cargarDatosParaModificar(this.data.Num_SDC, this.data.Num_Sec, this.data.Correlativo);
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

  colorantesDisponibles: { codigo: string, nombre: string, inicial: number } [] = [];
  curvas: {nombre: string, codigo: number, cantidad: number} [] = [];
  fijados: {nombre: string, codigo: number} [] = [];
  productos: {nombre: string, cantidad: number, porcentaje: number}[] = [];
  tiposFormulacion: {nombre: string, codigo: number} [] = [];
  coloranteSeleccionado: any = null;

  colorantesSeleccionados: any[] = [];

  parametros = {
    jabonadas: 0,
    curva: 0,
    fijado: 0,
    tiposFormulacion: ''
  };

  datos = {
    relacionBano: 8,
    pesoMuestra: 10,
    volumen: 80
  };


  cambiosHabilitados = false;

  agregarColorante(): void {
    if (!this.coloranteSeleccionado) return;

    this.colorantesSeleccionados.push({
      codigo: this.coloranteSeleccionado.codigo,
      nombre: this.coloranteSeleccionado.nombre,
      inicial: this.coloranteSeleccionado.inicial,
      ajuste: 0
    });
    
    
    this.coloranteControl.setValue('');
    this.coloranteSeleccionado = null;

    
    this.colorantesFiltrados = this.filtrarColorantes('');

    this.actualizarTotalFinal();
  }

  onColoranteSeleccionado(event: MatAutocompleteSelectedEvent): void {
    this.Familia = this.parametros.tiposFormulacion.toString();

    if (!this.Familia){
      this.toastr.warning('Debe seleccionar un Proceso', '', { timeOut: 2500 });
      return;
    }
    const colorante = event.option.value;
    this.coloranteSeleccionado = colorante;

    this.colorantesSeleccionados.push({
      codigo: colorante.codigo,
      nombre: colorante.nombre,
      inicial: parseFloat(colorante.inicial.toFixed(5)),
      ajuste: 0
    });

    this.coloranteControl.setValue('');
    this.coloranteSeleccionado = null;

    this.colorantesFiltrados = this.filtrarColorantes('');

    this.actualizarTotalFinal();
}

  mostrarNombre(colorante: any): string {
  return colorante?.nombre || '';
  }

  abrirAutocomplete(): void {
    if (this.coloranteControl.value && typeof this.coloranteControl.value === 'string') {
    this.autocompleteTrigger.openPanel();
    }
  }


  ajustar(colorante: any, delta: number): void {
    colorante.ajuste = parseFloat((colorante.ajuste + delta).toFixed(4));
  }

  calcularFinal(colorante: any): number {
    return Math.max(0, parseFloat((colorante.inicial + (colorante.inicial * colorante.ajuste)/100 ).toFixed(4)));
  }

  totalFinalColorantes: number = 0;
  condicion: number = 0;
  
  actualizarTotalFinal(): void {
    this.Familia = this.parametros.tiposFormulacion.toString();
      this.colorantesSeleccionados.forEach(c => {
        c.inicial = parseFloat(c.inicial.toFixed(5));
      });

      this.totalFinalColorantes = this.colorantesSeleccionados
        .map(c => this.calcularFinal(c))
        .reduce((acc, val) => acc + val, 0);

      this.GetCurvasJabonadoCalculado(this.totalFinalColorantes, this.Familia);
      this.GetFijadosCalculado(this.totalFinalColorantes, this.Familia);
      const contieneAmavose = this.colorantesSeleccionados.some(c => c.codigo === 'QC000441');

      if (contieneAmavose){
        this.condicion = 1;
      }

      this.GetCarbonatoSodaCalculado(this.totalFinalColorantes, this.Familia, this.condicion);
    
  }

  limitarDecimales(colorante: any): void {
    colorante.inicial = parseFloat(colorante.inicial.toFixed(5));
    this.actualizarTotalFinal();
  }

  habilitarCambios(): void {
    this.cambiosHabilitados = true;
    console.log('Cambios habilitados');
  }

  guardar(): void {
    this.guardarColorantesConParametros();
  }

  cerrar(): void {
    this.router.navigate(['HojaFormulacion']);
    console.log('Cerrando pantalla de agregar opción');
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

    producto.cantidad = +(baseCantidad + producto.porcentaje ).toFixed(2);
  }

  
  guardarColorantesConParametros(): void {
  if (this.colorantesSeleccionados.length === 0) {
    this.toastr.warning('Debe agregar al menos un colorante', '', { timeOut: 2500 });
    return;
  }

  const carbonato = this.productos.find(p => p.nombre.toUpperCase().includes('CARBONATO'));
  const soda = this.productos.find(p => p.nombre.toUpperCase().includes('SODA'));

  const comunes = {
    Corr_Carta: this.data?.Num_SDC?.toString() || '0',
    Sec: this.data?.Num_Sec?.toString() || '0',
    Correlativo: this.correlativo,
    Can_Jabo: this.parametros.jabonadas.toString(),
    Cur_Jabo: this.parametros.curva.toString(),
    Fijado: this.parametros.fijado.toString(),
    Rel_Ban: this.datos.relacionBano.toString(),
    Pes_Mue: this.datos.pesoMuestra.toString(),
    Volumen: this.datos.volumen.toString(),
    // Acidulado: this.parametros.acidulado.toString(),
    Car_Gr: carbonato?.cantidad.toString() || '0',
    Car_Por: carbonato?.porcentaje.toString() || '0',
    Sod_Gr: soda?.cantidad.toString() || '0',
    Sod_Por: soda?.porcentaje.toString() || '0',
    Familia: this.parametros.tiposFormulacion.toString()
  };

  const comunes2 = {
    Corr_Carta: this.data?.Num_SDC?.toString() || '0',
    Sec: this.data?.Num_Sec?.toString() || '0',
    Correlativo: this.correlativo,
    Familia: this.parametros.tiposFormulacion.toString()
  };

  Swal.fire({
    title: "¿Desea registrar todos los colorantes?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor:'#3085d6',
    cancelButtonColor:'#d33',
    confirmButtonText:'Sí',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      this.SpinnerService.show();

      let pendientes = this.colorantesSeleccionados.length;
      let errores = 0;

      this.colorantesSeleccionados.forEach((c, index) => {
        const datos = {
          ...comunes,
          Col_Cod: c.codigo,
          Procedencia: "Opcion Agregada",
          Por_Ini: c.inicial.toFixed(4),
          Por_Aju: c.ajuste.toFixed(4),
          Por_Fin: this.calcularFinal(c).toFixed(4)
        };
        console.log('el correlativo es: ', datos);
        this.LabColTraService.postAgregarOpcionColorante(datos).subscribe({
          next: (response: any) => {
            if (!response.success) errores++;
            pendientes--;
            if (pendientes === 0) this.finalizarGuardado(errores);
          },
          error: () => {
            errores++;
            pendientes--;
            if (pendientes === 0) this.finalizarGuardado(errores);
          }
        });
      });

      console.log('Datos comunes para auxiliares:', comunes2); 
      this.LabColTraService.postAgregarAuxiliaresHojaFormulacion(comunes2).subscribe({
        next: (response: any) => {
          console.log('Respuesta al agregar auxiliares:', response);
          if (response.success) {
            console.log('--entra al success---');
            console.log('Auxiliares agregados correctamente');
          }
        }
      });
    }
  });
}

finalizarGuardado(errores: number): void {
  this.SpinnerService.hide();
  if (errores === 0) {
    this.toastr.success('Todos los colorantes fueron guardados correctamente', '', { timeOut: 2500 });
    // this.dialogRef.close();
  } else {
    this.toastr.warning(`Se guardaron con ${errores} error(es)`, '', { timeOut: 3000 });
  }
}

colorantes = [];
GetColorantes(): void{
    this.SpinnerService.show();
    this.colorantes = [];
    this.LabColTraService.getListarColorantesAgregarOpcion().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
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
          }else{
            this.colorantes = [];
            this.SpinnerService.hide();
          }
        }else{
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

GetCurvasJabonado(): void{
    this.SpinnerService.show();
    this.curvas = [];
    this.LabColTraService.getListarJabonados().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            this.curvas = response.elements.map((c: any) => ({
              codigo: c.jab_Id,
              nombre: c.jab_Des
            }));
            this.SpinnerService.hide();
          }else{
            this.curvas = [];
            this.SpinnerService.hide();
          }
        }else{
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

GetCurvasJabonadoCalculado(Colorante_Total: number, Familia: string): void{
    this.SpinnerService.show();
    this.curvas = [];
    this.LabColTraService.getListarJabonadosCalculado(Colorante_Total, Familia).subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            console.log('los elementos jabonados calculados son: ', response.elements);
            this.curvas = response.elements.map((c: any) => ({
              codigo: c.jab_Id,
              nombre: c.jab_Des,
              cantidad: c.jab_Can
            }));

            this.parametros.curva = this.curvas[0]?.codigo || 0;
            this.parametros.jabonadas = this.curvas[0]?.cantidad || 0;

            this.SpinnerService.hide();
          }else{
            this.curvas = [];
            this.SpinnerService.hide();
          }
        }else{
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


GetFijados(): void{
    this.SpinnerService.show();
    this.fijados = [];
    this.LabColTraService.getListarFijados().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            this.fijados = response.elements.map((c: any) => ({
              codigo: c.fij_Id,
              nombre: c.fij_Des
            }));
            
            this.SpinnerService.hide();
          }else{
            this.fijados = [];
            this.SpinnerService.hide();
          }
        }else{
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

GetFijadosCalculado(Colorante_Total: number, Familia: string): void{
    this.SpinnerService.show();
    this.fijados = [];
    this.LabColTraService.getListarFijadosCalculado(Colorante_Total, Familia).subscribe({
      next: (response: any) => {
        if(response.success){
          console.log('los elementos fijados calculados son: ', response.elements);
          if(response.totalElements > 0){
            this.fijados = response.elements.map((c: any) => ({
              codigo: c.fij_Id,
              nombre: c.fij_Des
            }));

            this.parametros.fijado = this.fijados[0]?.codigo || 0;
            console.log('El valor en parametros fijado es: ', this.parametros.fijado);
            this.SpinnerService.hide();
          }else{
            this.fijados = [];
            this.SpinnerService.hide();
          }
        }else{
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

GetCarbonatoSodaCalculado(Colorante_Total: number, Familia: string, Com_Cod_Con: number): void{
    this.SpinnerService.show();
    this.productos = [];
    
    this.LabColTraService.getListarCarbonatoSodaCalculado(Colorante_Total, Familia, Com_Cod_Con).subscribe({
      next: (response: any) => {
        if(response.success){

          if(response.totalElements > 0){
            
            const datos = response.elements[0];

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
          }else{
            this.productos = [];
            this.SpinnerService.hide();
          }
        }else{
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

GetFamiliasProceso(): void{
    this.tiposFormulacion = [];
    this.LabColTraService.getListarFamiliasProceso().subscribe({
      next: (response: any) => {
        if(response.success){
          if(response.totalElements > 0){
            this.tiposFormulacion = response.elements.map((c: any) => ({
              codigo: c.pro_Cod,
              nombre: c.pro_Des
            }));
          }else{
            this.tiposFormulacion = [];
          }
        }else{
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
//   cargarDatosParaModificar(Corr_Carta: number, Sec: number, Correlativo: number): void {  
//   this.datosParaModificar = [];
//   this.LabColTraService.getCargarColoranteParaCopiar(Corr_Carta, Sec, Correlativo).subscribe({
//     next: (response: any) => {
//       this.datosParaModificar = response.elements;
//       console.log('Datos para modificar cargados: ', this.datosParaModificar);
      
//       this.colorantesSeleccionados = this.datosParaModificar.map((c: any) => ({
//         codigo: c.col_Cod,
//         nombre: c.col_Des,
//         inicial: c.por_Ini ? parseFloat(c.por_Ini.toFixed(5)) : 0,
//         ajuste: c.por_Aju ? parseFloat(c.por_Aju.toFixed(5)) : 0
//       }));
//       this.parametros = {
//         jabonadas: this.datosParaModificar.can_Jabo,
//         curva: this.datosParaModificar.cur_Jabo,
//         fijado: this.datosParaModificar.fijado,
//         tiposFormulacion: this.datosParaModificar.familia
//       };
//       //this.productos = response.productos;
//       this.datos = {
//         relacionBano: this.datosParaModificar.rel_Ban,
//         pesoMuestra: this.datosParaModificar.pes_Mue,
//         volumen: this.datosParaModificar.rel_Ban * this.datosParaModificar.pes_Mue
//       };
//     },
//     error: () => {
//       this.toastr.error('Error al cargar datos para modificar');
//     }
//   });
// }
cargarDatosParaModificar(Corr_Carta: number, Sec: number, Correlativo: number): void {
  this.datosParaModificar = [];

  this.LabColTraService.getCargarColoranteParaCopiar(Corr_Carta, Sec, Correlativo).subscribe({
    next: (response: any) => {
      const datos = response.elements?.[0];

      if (!datos) {
        this.toastr.warning('No se encontraron datos para modificar');
        return;
      }
      // Cargar productos auxiliares
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
    
      console.log('Productos cargados: ', this.productos);
      // Cargar colorantes seleccionados
      this.colorantesSeleccionados = (datos.colorantes ?? []).map((c: any) => ({
        codigo: c.col_Cod,
        nombre: c.col_Des,
        inicial: c.por_Ini ? parseFloat(c.por_Ini.toFixed(5)) : 0,
        ajuste: c.por_Aju ? parseFloat(c.por_Aju.toFixed(5)) : 0
      }));

      // Cargar parámetros de formulación
      this.parametros = {
        jabonadas: datos.can_Jabo ?? 0,
        curva: parseInt(datos.cur_Jabo) ?? 0,
        fijado: parseInt(datos.fijado) ?? 0,
        tiposFormulacion: datos.familia ?? ''
      };
      
      

      // Cargar datos de baño
      const peso = datos.pes_Mue ?? 0;
      const relacion = datos.rel_Ban ?? 0;

      this.datos = {
        relacionBano: relacion,
        pesoMuestra: peso,
        volumen: relacion * peso
      };

      // Actualizar total final de colorantes
      //this.actualizarTotalFinal();

    },
    error: (err) => {
      const msg = err?.error?.message ?? 'Error al cargar datos para modificar';
      this.toastr.error(msg);
    }
  });
}




  
}
