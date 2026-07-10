import { Component, OnInit, Optional, Inject } from '@angular/core';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import html2canvas from 'html2canvas';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

interface Insumo {
  col_Cod: string;
  col_Des: string;
  por_Fin: number | string;
  correlativo: number;
  id_secuencia: number;
  procedencia: string
}

interface Ph {
  ph_Ini: number;
}

interface Ruta {
  descripcion: string;
}

interface Solidez {
  descripcion: string;
}

interface ReporteBackend {
  acabado: string;
  analista: string;
  articulo: string;
  can_Jab: number;
  corr_Carta: any;
  sec: number;
  correlativo: number;
  descripcion_Color: string;
  nom_Cliente: string;
  previo: string;
  enz_Can: number;
  enz_Den_Bno: string;
  tip_Ten: string;
  cur_Ten: string;
  cur_Jab: string;
  fijado: string;
  partidasAgrupadas: string;
  cod_Color: string;
  tipoPartida: string;
  temporada: string;
  kgs_Prod: string;
  r_B_Prod: string;
  maquina: string;
  rel_Ban: string;
  pro_Des: string;
  tipoReceta: string;
  descarga: string;
  lote_Hilado: string;
  colorantes_Reporte: Insumo[];
  ruta_Reporte: Ruta[];
  solidez_Reporte: Solidez[];
  partida_Agrupada_Tinto: string; //Nuevo
  rel_Ban_Sige: string; //Nuevo
  pes_Mue: string; //Nuevo
  flg_Est_Lab: string; //Nuevo
}

interface data {
  sdcR: any,
  secuenciaR: number,
  tipoRecetaR: string
}

interface Colorante {
  col_Des: string;
  por_Fin: number;
  por_Aju: number;
  ingreso_Manual: number; // 0 = automático, 1 = manual
}

interface ph {
  ph_Ini: number,
  ph_Fin: number,
  ph_Jab: number,
  ph_Des: number,
  ph_Jab2: number,
  ph_Jab3: number,
}

@Component({
  selector: 'app-lab-report',
  templateUrl: './lab-report.component.html',
  styleUrls: ['./lab-report.component.scss']
})
export class LabReportComponent implements OnInit {
  grupos: { correlativo: number; insumos: Insumo[]; reporte: ReporteBackend, placeholder?: boolean }[] = [];
  loading = false;
  error?: string;
  mostrarCabecera = true;
  colorantesTabla: {
    descripcion: string;
    valores: { correlativo: number; porcentaje: string | number; id_secuencia: number  }[];
  }[] = [];

  correlativos: number[] = [];
  boxes1 = Array.from({ length: 10 }, (_, i) => i + 1);   // [1..10]
  boxes2 = Array.from({ length: 10 }, (_, i) => i + 11);  // [11..20]

  recetaDetalle: Colorante[] = [];
  procedencia: string = '';
  reportePH: ph[] = [];
  isCapturing = false;
  reporteListo = false;
  imprimiendo = false;

  constructor(
    private labColTrabajoService: LabColTrabajoService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {
    if (!this.data) {
      this.data = {
        sdcR: '',
        secuenciaR: 0,
        tipoRecetaR: ''
      };
    }
  }

  ngOnInit(): void {
    this.ngOnGetParams();
  }

  ngOnGetParams(): void {
    this.route.queryParams.subscribe(params => {
      this.data = {
        sdcR: params['sdcE'] !== undefined ? String(params['sdcE']).trim() : '',
        secuenciaR: params['secuenciaE'] !== undefined ? Number(params['secuenciaE']) : 0,
        tipoRecetaR: params['tipoRecetaE'] !== undefined ? String(params['tipoRecetaE']).trim().toUpperCase() : ''
      };
      const empiezaConLetra = /^[A-Za-z]/.test(this.data.sdcR);
      this.mostrarCabecera = empiezaConLetra;
      console.log('la cabecera está en::::::::::::::::::::.', this.mostrarCabecera);
      this.cargarDatosReporte(this.data.sdcR, this.data.secuenciaR, this.data.tipoRecetaR);
    });
  }


  cargarDatosReporte(corrCarta: any, sec: number, Tip_Ten: string): void {
    this.loading = true;
    this.reporteListo = false;

    // forkJoin espera a que las 3 llamadas HTTP terminen antes de procesar
    // Esto evita la condición de carrera (race condition) donde html2canvas
    // capturaba el DOM antes de que llegaran los datos de Tricomía y pH.
    forkJoin({
      principal: this.labColTrabajoService.getCargarDatosReporte(corrCarta, sec, Tip_Ten),
      trico:     this.labColTrabajoService.getCargarDatosReporteTrico(corrCarta, sec, Tip_Ten),
      ph:        this.labColTrabajoService.getCargarDatosReportePH(corrCarta, sec, Tip_Ten),
    }).subscribe({
      next: ({ principal, trico, ph }: any) => {
        const reporte: ReporteBackend = {
          ...principal.elements[0],
          colorantes_Reporte: principal.elements[0].colorantes_Reporte ?? [],
          ruta_Reporte: principal.elements[0].ruta_Reporte ?? [],
          solidez_Reporte: principal.elements[0].solidez_Reporte ?? [],
          id_secuencia: principal.elements[0].id_secuencia ?? 0  // corregido: antes era .elements.id_secuencia (bug)
        };

        if (reporte && (!this.data.tipoRecetaR || this.data.tipoRecetaR === '')) {
          if (reporte.tipoReceta) {
            this.data.tipoRecetaR = String(reporte.tipoReceta).trim().toUpperCase();
          }
        }

        reporte.colorantes_Reporte = (reporte.colorantes_Reporte ?? []).sort((a, b) => {
          const prioridad = [1, 2, 3];
          const aPrioridad = prioridad.includes(a.id_secuencia) ? 0 : 1;
          const bPrioridad = prioridad.includes(b.id_secuencia) ? 0 : 1;
          if (aPrioridad !== bPrioridad) return aPrioridad - bPrioridad;
          return a.id_secuencia - b.id_secuencia;
        });

        console.log('EL REPORTE ES::::::::::::::::::::::::::::::.', reporte);

        this.procedencia = reporte.colorantes_Reporte.length > 0
          ? reporte.colorantes_Reporte[0].procedencia ?? ''
          : '';

        this.grupos = this.groupByCorrelativo(reporte)
          .sort((a, b) => a.correlativo - b.correlativo);

        this.construirTabla();

        // Datos de Tricomía y pH — ya disponibles porque forkJoin esperó las 3
        this.recetaDetalle = trico.elements ?? [];
        this.reportePH = ph.elements ?? [];

        console.log('EL REPORTE DE TRICOMIA ES::::::::::::::::::::::::::::::.', this.recetaDetalle);
        console.log('EL REPORTE DE PH ES::::::::::::::::::::::::::::::.', this.reportePH);

        this.loading = false;
        this.reporteListo = true;  // El botón de imprimir se habilitará ahora
      },
      error: (err) => {
        this.loading = false;
        this.error = 'No se pudo cargar el reporte. Intente nuevamente.';
        console.error('Error al cargar el reporte', err);
      }
    });
  }


  private groupByCorrelativo(reporte: ReporteBackend): { correlativo: number; insumos: Insumo[]; reporte: ReporteBackend; placeholder?: boolean }[] {
    if (!reporte.colorantes_Reporte || reporte.colorantes_Reporte.length === 0) {
      return [{
        correlativo: -1,
        insumos: [],
        reporte,
        placeholder: true
      }];
    }

    const plantilla = Array.from(
      new Set(reporte.colorantes_Reporte.map(i => i.col_Des))
    ).sort((a, b) => a.localeCompare(b));

    const map = new Map<number, Insumo[]>();
    reporte.colorantes_Reporte.forEach(i => {
      if (!map.has(i.correlativo)) map.set(i.correlativo, []);
      map.get(i.correlativo)!.push(i);
    });

    return Array.from(map.entries()).map(([correlativo, insumos]) => {
      const normalizados = plantilla.map(des => {
        const match = insumos.find(i => i.col_Des === des);
        return {
          col_Cod: match?.col_Cod ?? '',
          col_Des: des,
          por_Fin: match?.por_Fin ?? '0.0000',
          correlativo,
          id_secuencia: match?.id_secuencia ?? 0,
          procedencia: match?.procedencia ?? ''        
        };
      });

      normalizados.sort((a, b) => a.id_secuencia - b.id_secuencia);

      return { correlativo, insumos: normalizados, reporte };
    });
  }



  trackByIndex(index: number) {
    return index;
  }

  imprimirReporteRed() {
    if (this.imprimiendo) return;
    this.imprimiendo = true;
    this.toastr.info('Capturando pantalla y procesando reporte...', 'Impresión', { timeOut: 3000 });

    const element = document.querySelector('.report-only') as HTMLElement;

    html2canvas(element, { 
      scale: 2, 
      windowWidth: 1200, 
      useCORS: true 
    }).then(canvas => {
      console.log('Canvas generado. Tamaño:', canvas.width, 'x', canvas.height);
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Error: canvas.toBlob devolvió null');
          this.imprimiendo = false;
          this.toastr.error('Error al generar la imagen del reporte.', 'Impresión');
          return;
        }

        console.log('Blob generado. Tamaño:', blob.size, 'bytes');
        const formData = new FormData();
        formData.append('reporte', blob, 'reporte.png');

        this.toastr.info('Enviando reporte a la impresora en red...', 'Impresión');
        this.labColTrabajoService.postImprimirReporteLabDip(formData).subscribe({
          next: (response: any) => {
            this.imprimiendo = false;
            this.toastr.success('Reporte enviado a la impresora en red.', 'Impresión');
            console.log('Reporte enviado al backend para impresión en red', response);
          },
          error: err => {
            this.imprimiendo = false;
            this.toastr.error(`Error al enviar reporte: ${err.status} ${err.statusText}`, 'Impresión');
            console.error('Error al enviar reporte:', err.status, err.statusText, err.error);
          }
        });
      });  
    }).catch(err => {
      this.imprimiendo = false;
      this.toastr.error('Error al capturar la pantalla.', 'Impresión');
      console.error(err);
    });
  }

  imprimirReporte() {
    const element = document.querySelector('.report-only') as HTMLElement;

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
        <html>
          <head>
            <title>Reporte</title>
            <style>
        @page {
          size: A4 landscape; /* o landscape */
          margin: 10mm;
        }
        body { margin: 0; display: flex; justify-content: center; }
        img { width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }
            </script>
          </body>
        </html>
      `);
        printWindow.document.close();
      }
    });
  }

  // imprimirReporte() {
  //   const element = document.querySelector('.report-only') as HTMLElement;

  //   html2canvas(element, { scale: 2 }).then(canvas => {
  //     const imgData = canvas.toDataURL('image/png');

  //     // Crear un iframe oculto para imprimir directamente
  //     const iframe = document.createElement('iframe');
  //     iframe.style.position = 'fixed';
  //     iframe.style.right = '0';
  //     iframe.style.bottom = '0';
  //     iframe.style.width = '0';
  //     iframe.style.height = '0';
  //     iframe.style.border = '0';
  //     document.body.appendChild(iframe);

  //     iframe.onload = () => {
  //       const doc = iframe.contentWindow?.document;
  //       if (doc) {
  //         doc.open();
  //         doc.write(`
  //         <html>
  //           <head>
  //             <title>Reporte</title>
  //             <style>
  //               body { margin: 0; display: flex; justify-content: center; }
  //               img { max-width: 100%; height: auto; }
  //             </style>
  //           </head>
  //           <body>
  //             <img src="${imgData}" />
  //             <script>
  //               window.onload = function() {
  //                 window.print();
  //                 window.onafterprint = function() { window.close(); };
  //               }
  //             </script>
  //           </body>¿
  //         </html>
  //       `);
  //         doc.close();
  //       }
  //     };
  //   });
  // }


  Cerrar(): void {
    this.router.navigate(['/ColaTrabajo']);
  }


  private construirTabla(): void {
    const descripciones = Array.from(
      new Set(this.grupos.flatMap(g => g.insumos.map(i => i.col_Des)))
    ).sort((a, b) => a.localeCompare(b));

    this.colorantesTabla = descripciones.map(des => {
      const valores = this.grupos.map(grupo => {
        const match = grupo.insumos.find(i => i.col_Des === des);
        return {
          correlativo: grupo.correlativo,
          porcentaje: match?.por_Fin ?? '0.0000',
          id_secuencia: match?.id_secuencia ?? 999
        };
      });
      return { descripcion: des, valores };
    });

    this.colorantesTabla.sort((a, b) => {
      const aSeq = Math.min(...a.valores.map(v => v.id_secuencia));
      const bSeq = Math.min(...b.valores.map(v => v.id_secuencia));
      return aSeq - bSeq;
    });


    this.correlativos = this.grupos.map(g => g.correlativo);
  }

  generarPDF(): void {
    const element = document.querySelector('.report-only') as HTMLElement;

    // Guardar el ancho original y forzar un ancho de PC de escritorio (1400px)
    // para que la captura en el PDF sea horizontal y aproveche todo el espacio de la hoja.
    const originalWidth = element.style.width;
    element.style.width = '1400px';

    html2canvas(element, { 
      scale: 2,
      windowWidth: 1400
    }).then(canvas => {
      // Restaurar el ancho original del elemento en pantalla
      element.style.width = originalWidth;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);

      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const blob = pdf.output('blob');
      const formData = new FormData();
      formData.append('file', blob, 'reporte.pdf');

      this.labColTrabajoService.enviarPDF(formData).subscribe({
        next: () => console.log('PDF enviado al backend'),
        error: (err: any) => console.error('Error al enviar PDF', err)
      });
    });
  }

  


}
