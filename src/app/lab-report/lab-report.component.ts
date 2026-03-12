import { Component, OnInit, Optional, Inject } from '@angular/core';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import html2canvas from 'html2canvas';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';


interface Insumo {
  col_Cod: string;
  col_Des: string;
  por_Fin: number | string;
  correlativo: number;
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
  colorantes_Reporte: Insumo[];
  ruta_Reporte: Ruta[];
  solidez_Reporte: Solidez[];
}

interface data {
  sdcR: any,
  secuenciaR: number,
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

  colorantesTabla: {
    descripcion: string;
    valores: { correlativo: number; porcentaje: string | number }[];
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
      };
    });

    this.cargarDatosReporte(this.data.sdcR, this.data.secuenciaR, 0);
  }


  cargarDatosReporte(corrCarta: any, sec: number, correlativo: number): void {
    this.loading = true;
    this.labColTrabajoService.getCargarDatosReporte(corrCarta, sec, correlativo).subscribe({

      next: (response: any) => {
        const reporte: ReporteBackend = {
          ...response.elements[0],
          colorantes_Reporte: response.elements[0].colorantes_Reporte ?? [],
          ruta_Reporte: response.elements[0].ruta_Reporte ?? [],
          solidez_Reporte: response.elements[0].solidez_Reporte ?? []
        };

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
          correlativo
        };
      });

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
          porcentaje: match?.por_Fin ?? '0.0000'
        };
      });
      return { descripcion: des, valores };
    });

    this.correlativos = this.grupos.map(g => g.correlativo);
  } 
}
