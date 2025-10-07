import { Component, OnInit, Optional, Inject } from '@angular/core';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface data {
  Title: string,
  Num_SDC: number,
  Num_Sec: number,
}

interface ColoranteCompleto {
  // Identificador del colorante
  Corr_Carta: string;
  Sec: string;
  Procedencia: string;
  Col_Cod: string;
  Por_Ini: string;
  Por_Aju: string;
  Por_Fin: string;
  Can_Jabo: string;
  Cur_Jabo: string;
  Fijado  : string;
  Rel_Ban : string;
  Pes_Mue : string;
  Volumen : string;
  Acidulado: string;
  Car_Gr  : string;
  Car_Por : string;
  Sod_Gr  : string;
  Sod_Por : string;
}

@Component({
  selector: 'app-dialog-agregar-opcion',
  templateUrl: './dialog-agregar-opcion.component.html',
  styleUrl: './dialog-agregar-opcion.component.scss'
})
export class DialogAgregarOpcionComponent implements OnInit {

  constructor(
    private SpinnerService: NgxSpinnerService,
    private LabColTraService: LabColTrabajoService,
    private toastr: ToastrService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    public dialogRef: MatDialogRef<DialogAgregarOpcionComponent>
  ){}

  ngOnInit(): void {
    // console.log(this.data.Num_SDC);
    // console.log(this.data.Num_Sec);
  }

  colorantesDisponibles = [
    { codigo: 'QC000001', nombre: 'AVITERA GOLD SE', inicial: 0.105 },
    { codigo: 'QC000002', nombre: 'AVITERA ROJO CLARO SE', inicial: 0.0032 },
    { codigo: 'QC000003', nombre: 'AVITERA AZUL CLARO SE', inicial: 0.0024 }
  ];

  coloranteSeleccionado: any = null;

  colorantesSeleccionados: any[] = [];

  parametros = {
    jabonadas: 2,
    curva: 1,
    fijado: 2,
    acidulado: 1
  };

  curvas = [{nombre:'SEIFOL 80°C', codigo: 1}, {nombre:'SEIFOL 90°C', codigo:2}];
  fijados = [{nombre: 'REWIN', codigo: 1}, {nombre:'REACTIVA', codigo: 2}];
  acidulados = [{nombre: 'DACID 2', codigo: 1}, {nombre: 'DACID 3', codigo: 2}];
  productos = [
    { nombre: 'CARBONATO', cantidad: 10, porcentaje: 10 },
    { nombre: 'SODA', cantidad: 5 , porcentaje: 2}
  ];

  datos = {
    relacionBano: 10,
    pesoMuestra: 80,
    volumen: 800
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
    console.log(this.coloranteSeleccionado.codigo);
  }

  onCargarComboBox(){
    
  }


  ajustar(colorante: any, delta: number): void {
    colorante.ajuste = parseFloat((colorante.ajuste + delta).toFixed(4));
  }

  calcularFinal(colorante: any): number {
    return Math.max(0, parseFloat((colorante.inicial + colorante.ajuste).toFixed(4)));
  }

  habilitarCambios(): void {
    this.cambiosHabilitados = true;
    console.log('Cambios habilitados');
  }

  guardar(): void {
    this.guardarColorantesConParametros();
  }

  cerrar(): void {
    console.log('Cerrando pantalla de agregar opción');
  }

  quitarColorante(colorante: any): void {
  this.colorantesSeleccionados = this.colorantesSeleccionados.filter(c => c !== colorante);
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
    Can_Jabo: this.parametros.jabonadas.toString(),
    Cur_Jabo: this.parametros.curva.toString(),
    Fijado: this.parametros.fijado.toString(),
    Rel_Ban: this.datos.relacionBano.toString(),
    Pes_Mue: this.datos.pesoMuestra.toString(),
    Volumen: this.datos.volumen.toString(),
    Acidulado: this.parametros.acidulado.toString(),
    Car_Gr: carbonato?.cantidad.toString() || '0',
    Car_Por: carbonato?.porcentaje.toString() || '0',
    Sod_Gr: soda?.cantidad.toString() || '0',
    Sod_Por: soda?.porcentaje.toString() || '0'
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
    }
  });
}

finalizarGuardado(errores: number): void {
  this.SpinnerService.hide();
  if (errores === 0) {
    this.toastr.success('Todos los colorantes fueron guardados correctamente', '', { timeOut: 2500 });
    this.dialogRef.close();
  } else {
    this.toastr.warning(`Se guardaron con ${errores} error(es)`, '', { timeOut: 3000 });
  }
}


}
