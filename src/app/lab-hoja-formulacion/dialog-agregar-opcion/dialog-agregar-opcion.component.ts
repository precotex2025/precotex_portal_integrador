import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-agregar-opcion',
  templateUrl: './dialog-agregar-opcion.component.html',
  styleUrl: './dialog-agregar-opcion.component.scss'
})
export class DialogAgregarOpcionComponent implements OnInit {
  ngOnInit(): void {
    
  }

  colorantesDisponibles = [
    { nombre: 'AVITERA GOLD SE', inicial: 0.105 },
    { nombre: 'AVITERA ROJO CLARO SE', inicial: 0.0032 },
    { nombre: 'AVITERA AZUL CLARO SE', inicial: 0.0024 }
  ];

  coloranteSeleccionado: any = null;

  colorantesSeleccionados: any[] = [];

  parametros = {
    jabonadas: 2,
    curva: 'SEIFOL 80°C',
    fijado: 'REWIN'
  };

  curvas = ['SEIFOL 80°C', 'SEIFOL 90°C'];
  fijados = ['REWIN', 'REACTIVA'];

  productos = [
    { nombre: 'CARBONATO', cantidad: 10 },
    { nombre: 'SODA', cantidad: 5 }
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
      nombre: this.coloranteSeleccionado.nombre,
      inicial: this.coloranteSeleccionado.inicial,
      ajuste: 0
    });
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
    const resultado = this.colorantesSeleccionados.map(c => ({
      nombre: c.nombre,
      inicial: c.inicial,
      ajuste: c.ajuste,
      final: this.calcularFinal(c)
    }));

    console.log('Guardando opción:', {
      colorantes: resultado,
      parametros: this.parametros,
      productos: this.productos,
      datos: this.datos
    });

  }

  cerrar(): void {
    console.log('Cerrando pantalla de agregar opción');
  }

  quitarColorante(colorante: any): void {
  this.colorantesSeleccionados = this.colorantesSeleccionados.filter(c => c !== colorante);
  }


}
