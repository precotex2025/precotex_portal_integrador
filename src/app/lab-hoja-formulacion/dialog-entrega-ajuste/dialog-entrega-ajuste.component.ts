import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { NgxSpinnerService } from 'ngx-spinner';

interface data {
  corr_Carta: any;
  sec: number;
  correlativos: any[];
  PartidasAgrupadasE: string;
}

@Component({
  selector: 'app-dialog-entrega-ajuste',
  templateUrl: './dialog-entrega-ajuste.component.html',
  styleUrls: ['./dialog-entrega-ajuste.component.scss']
})
export class DialogEntregaAjusteComponent implements OnInit {

  colorantesDetalle: any[] = [];
  displayedColumns: string[] = ['col_Cod', 'col_Des', ...this.data.correlativos];
  colorantes: any[] = [];
  CorrelativoNuevo: number = 0;
  Familia: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: data,
    private dialogRef: MatDialogRef<DialogEntregaAjusteComponent>,
    private service: LabColTrabajoService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.displayedColumns = ['col_Cod', 'col_Des', ...this.data.correlativos.map(c => c.toString())];
    console.log('Columnas definidas:', this.displayedColumns);

    for (const corr of this.data.correlativos) {
      this.getCargarColoranteParaDetalle(this.data.corr_Carta, this.data.sec, corr);
    }
  }

  getCargarColoranteParaDetalle(corr_Carta: any, sec: number, correlativo: number): void {
    this.service.getCargarColoranteParaDetalle(corr_Carta, sec, correlativo).subscribe({
      next: (response: any) => {

        const lista: any[] = [];
        if (response?.elements) {
          response.elements.forEach((item: any) => {
            if (item.colorantes) {
              lista.push(...item.colorantes);
            }
          });
        }

        lista.forEach((c: any) => {
          const existente = this.colorantes.find(x => x.col_Cod === c.col_Cod);

          if (existente) {
            if (!existente.valores) existente.valores = {};
            existente.valores[correlativo.toString()] = { por_Fin: c.por_Fin ?? 0 };
          } else {
            if (!c.valores) c.valores = {};
            c.valores[correlativo.toString()] = { por_Fin: c.por_Fin ?? 0 };
            this.colorantes.push(c);
          }
        });

        this.colorantes.sort((a, b) => {
          const letraA = a.col_Des?.charAt(0).toUpperCase() || '';
          const letraB = b.col_Des?.charAt(0).toUpperCase() || '';
          return letraA.localeCompare(letraB);
        });

        this.colorantes = [...this.colorantes];
      },
      error: (error: any) => {
        console.error('Error cargando colorantes:', error);
      }
    });
  }

  getUltimoCorrelativo(Corr_Carta: string, Sec: number): Promise<any> {
    return this.service.getObtenerUltimoCorrelativo(Corr_Carta, Sec).toPromise();
  }

  postColorante(registro: any): Promise<any> {
    return this.service.postAgregarOpcionAjustada(registro).toPromise();
  }

  postAuxiliares(registroAux: any): Promise<any> {
    return this.service.postAgregarAuxiliaresHojaFormulacion(registroAux).toPromise();
  }

  patchEntrega(entrega: any): Promise<any> {
    return this.service.patchActualizarEstadoEntregaProduccion(entrega).toPromise();
  }

  async guardar() {
    console.log('--- Iniciando registro correlativos ---');
    this.spinner.show();

    const correlativosOrdenados = [...this.data.correlativos].sort((a, b) => b - a);

    try {
      for (const corr of correlativosOrdenados) {
        const response = await this.getUltimoCorrelativo(this.data.corr_Carta, this.data.sec);
        const correlativoNuevo = response.elements[0].correlativo;
        const familia = response.elements[0].familia;

        console.log(`Procesando correlativo ${corr} con secuencia ${correlativoNuevo} y familia ${familia}`);

        for (const colorante of this.colorantes) {
          const valor = colorante.valores[corr]?.por_Fin ?? 0;

          const registro = {
            corr_Carta: this.data.corr_Carta,
            sec: this.data.sec,
            correlativo: corr,
            col_Cod: colorante.col_Cod,
            por_Fin: valor,
            correlativo_Nuevo: correlativoNuevo
          };

          console.log('Guardando colorante:', registro);
          await this.postColorante(registro);
        }

        const registroAuxiliares = {
          corr_Carta: this.data.corr_Carta,
          sec: this.data.sec,
          correlativo: correlativoNuevo,
          familia: familia,
          cambio: 0,
          procedenciaHardCodeada: 'Mosquito'
        };

        console.log('Guardando auxiliares:', registroAuxiliares);
        await this.postAuxiliares(registroAuxiliares);
      }

      console.log('--- Registro finalizado ---');
    } catch (error) {
      console.error('Error en el proceso:', error);
    } finally {
      this.dialogRef.close();
      this.spinner.hide();
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  getObtenerUltimoCorrelativo(Corr_Carta: any, Sec: number): void {
    this.service.getObtenerUltimoCorrelativo(Corr_Carta, Sec).subscribe({
      next: (response: any) => {
        this.CorrelativoNuevo = response.elements[0].correlativo;
        console.log(this.CorrelativoNuevo);
      },
      error: (error: any) => {

      }
    });
  }


  async guardarPorPartida(corr_Carta: string, sec: number): Promise<void> {
    const correlativosOrdenados = [...this.data.correlativos].sort((a, b) => b - a);

    for (const corr of correlativosOrdenados) {
      const response = await this.getUltimoCorrelativo(corr_Carta, sec);
      const correlativoNuevo = response.elements[0].correlativo;
      const familia = response.elements[0].familia;

      console.log(`Procesando correlativo ${corr} con secuencia ${correlativoNuevo} y familia ${familia}`);

      for (const colorante of this.colorantes) {
        const valor = colorante.valores[corr]?.por_Fin ?? 0;
        const registro = {
          corr_Carta: corr_Carta,
          sec: 1,
          correlativo: corr,
          col_Cod: colorante.col_Cod,
          por_Fin: valor,
          correlativo_Nuevo: correlativoNuevo
        };
        console.log('Guardando colorante:', registro);
        await this.postColorante(registro);
      }

      const registroAuxiliares = {
        corr_Carta: corr_Carta,
        sec: 1,
        correlativo: correlativoNuevo,
        familia: familia,
        cambio: 0,
        procedenciaHardCodeada: 'Mosquito'
      };
      console.log('Guardando auxiliares:', registroAuxiliares);
      await this.postAuxiliares(registroAuxiliares);
    }
  }

  async guardarAgrupado(): Promise<void> {
    this.spinner.show();
    console.log('LAS PARTIDAS AGRUPADAS SON:::::::::::::::::::::::::::::::::::.', this.data.PartidasAgrupadasE);
    try {
      if (!this.data.PartidasAgrupadasE) {

        await this.guardarPorPartida(this.data.corr_Carta, this.data.sec);
        await this.entregarPartida(this.data.corr_Carta);
      } else {

        const partidas = this.data.PartidasAgrupadasE.split('/')
          .map(p => p.trim())
          .filter(p => p.length > 0);

        for (const partida of partidas) {
          console.log('Registrando partida secuencial:', partida);
          await this.guardarPorPartida(partida, this.data.sec);
          await this.entregarPartida(partida);
        }
      }

    } catch (error) {
      console.error('Error en el proceso:', error);
    } finally {
      this.spinner.hide();
      this.dialogRef.close();
    }
  }

  async entregarPartida(Cod_OrdTra: string): Promise<void>{
    try{
      const entrega = {
        cod_OrdTra: Cod_OrdTra
      }

      await this.patchEntrega(entrega);

    }catch(error){
      console.error('Error al entregar:', error);
    }
  }





}
