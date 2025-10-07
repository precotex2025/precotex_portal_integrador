import { Component } from '@angular/core';

@Component({
  selector: 'app-lab-disp-autolab',
  templateUrl: './lab-disp-autolab.component.html',
  styleUrl: './lab-disp-autolab.component.scss'
})
export class LabDispAutolabComponent {

  estadoSeleccionado: 'cola' | 'dispensado' = 'cola';

    columnsToDisplay: string[] = [
    'seleccion',
    'id_disp',
    'num_bandeja',
    'id_tubo',
    'sdc',
    'color',
    'curva',
    'volumen'
  ];

  dataSource = [
    { id_disp: 1, num_bandeja: 1, id_tubo: 1, sdc: 7510, color: 'ROJO', curva: 'AVITERA 60°C', volumen: 80, seleccionado: false },
  ];

  toggleAllRows(checked: boolean): void {
    this.dataSource.forEach(row => row.seleccionado = checked);
  }


  isAllSelected(): boolean {
    return this.dataSource.every(row => row.seleccionado);
  }

  isIndeterminate(): boolean {
    const selected = this.dataSource.filter(row => row.seleccionado);
    return selected.length > 0 && selected.length < this.dataSource.length;
  }

  enviarADispensar(): void {
  }


  cambiarEstado(valor: 'cola' | 'dispensado'): void {
    this.estadoSeleccionado = valor;
    console.log('Filtro activo:', valor);
  }
}
