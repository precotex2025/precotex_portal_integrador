import { Component, OnInit, Optional, Inject } from '@angular/core';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import html2canvas from 'html2canvas';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';

interface Insumo {
  col_Cod: string;
  col_Des: string;
  por_Fin: number | string;
  correlativo: number;
  id_secuencia: number;
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
  colorantes_Reporte: Insumo[];
  ruta_Reporte: Ruta[];
  solidez_Reporte: Solidez[];
}

interface data {
  sdcR: any,
  secuenciaR: number,
  tipoRecetaR: string
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


  constructor(
    private labColTrabajoService: LabColTrabajoService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: data,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ngOnGetParams();
  }

  ngOnGetParams(): void {
    this.route.queryParams.subscribe(params => {
      this.data = {
        sdcR: params['sdcE'] !== undefined ? String(params['sdcE']) : '',
        secuenciaR: params['secuenciaE'] !== undefined ? Number(params['secuenciaE']) : 0,
        tipoRecetaR: params['tipoRecetaE'] !== undefined ? String(params['tipoRecetaE']): ''
      };
    });
    const empiezaConLetra = /^[A-Za-z]/.test(this.data.sdcR);
    this.mostrarCabecera = empiezaConLetra;
    console.log('la cabecera está en::::::::::::::::::::.', this.mostrarCabecera);
    this.cargarDatosReporte(this.data.sdcR, this.data.secuenciaR, 'O');
  }


  cargarDatosReporte(corrCarta: any, sec: number, Tip_Ten: string): void {
    this.loading = true;
    this.labColTrabajoService.getCargarDatosReporte(corrCarta, sec, Tip_Ten).subscribe({

      next: (response: any) => {
        const reporte: ReporteBackend = {
          ...response.elements[0],
          colorantes_Reporte: response.elements[0].colorantes_Reporte ?? [],
          ruta_Reporte: response.elements[0].ruta_Reporte ?? [],
          solidez_Reporte: response.elements[0].solidez_Reporte ?? [],
          id_secuencia: response.elements.id_secuencia ?? 0
        };

        reporte.colorantes_Reporte = (reporte.colorantes_Reporte ?? []).sort((a, b) => {
          const prioridad = [1, 2, 3];
          const aPrioridad = prioridad.includes(a.id_secuencia) ? 0 : 1;
          const bPrioridad = prioridad.includes(b.id_secuencia) ? 0 : 1;

          if (aPrioridad !== bPrioridad) {
            return aPrioridad - bPrioridad; // primero los 1,2,3
          }
          return a.id_secuencia - b.id_secuencia; // luego orden normal
        });

        console.log('EL REPORTE ES::::::::::::::::::::::::::::::.', reporte);

        this.grupos = this.groupByCorrelativo(reporte)
          .sort((a, b) => a.correlativo - b.correlativo);

        this.construirTabla();

        this.loading = false;
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
          id_secuencia: match?.id_secuencia ?? 0
        };
      });

      normalizados.sort((a, b) => a.id_secuencia - b.id_secuencia);

      return { correlativo, insumos: normalizados, reporte };
    });
  }



  trackByIndex(index: number) {
    return index;
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
              body { margin: 0; display: flex; justify-content: center; }
              img { max-width: 100%; height: auto; }
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

    html2canvas(element, { scale: 2 }).then(canvas => {
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
