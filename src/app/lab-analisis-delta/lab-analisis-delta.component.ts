import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../authentication/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration } from 'chart.js';
import { Router } from '@angular/router';

interface combo {
  codigo: string;
  descripcion: string;
}

interface datadet {
         SampleId: number,
         Name: String,
         MeasId: number,
         Est_CIE_L: number,
         Est_CIE_a: number,
         Est_CIE_b: number,
         Est_CIE_C: number,
         Est_CIE_h: number,
         Especularidad: string,
         Filtro_UV: string
}

@Component({
  selector: 'app-lab-analisis-delta',
  templateUrl: './lab-analisis-delta.component.html',
  styleUrl: './lab-analisis-delta.component.scss'
})
export class LabAnalisisDeltaComponent implements OnInit {

  lstTipoMuestra: combo[] = [];
  lstColor: combo[] = [];
  lstArticulo: combo[] = [];
  lstEstandar: combo[] = [];

  cant_estandar = 0;
  colorClase: string = ''; 

  opcionesNormales1: string[] = [];
  opcionesNormales2: string[] = [];

  Usuario: string = '';
  dataInfoPartida: Array<any> = [];

  // Variable para guardar los seleccionados
  tipoMuestraSeleccionada: string[] = [];
  concatenado: string = '';


  scatterChartOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: true,
    scales: {
      x: { min: -1, max: 1, title: { display: true, text: 'Δa' } },
      y: { min: -1, max: 1, title: { display: true, text: 'Δb' } }
    }
  };      
  scatterChartData: ChartConfiguration<'scatter'>['data'] = {
    datasets: [
      {
        label: 'Plano cartesiano',
        data: [
        { x: 0.33, y: 0.25 },
        { x: 0.15, y: -0.38 },
        { x: 0.48, y: -0.14 },
        { x: 0.34, y: 0.21 }

        ], //Se llena en el buscar
        backgroundColor: 'blue'
      }
    ]
  };  

  constructor(
    private formBuilder           : FormBuilder         ,
    private SpinnerService        : NgxSpinnerService   ,
    private matSnackBar           : MatSnackBar           ,
    private LabColaTrabajoService : LabColTrabajoService,
    private authService           : AuthService         ,
    private toastr                : ToastrService       ,
    private router                : Router              ,
    
  ){
    
  }

  ngOnInit(): void {
    this.Usuario = this.authService.getUsuario()!;
    this.formulario.get('ctrol_CodOrdTra')?.valueChanges.subscribe((valor: any) => {
      if (valor && valor.length === 5) {
        this.MostrarDatosPartida();
      }
    }); 

    

  }

  displayedColumns: string[] = [
    //'SampleId' , 
    'Name',
    //'MeasId',
    'Est_CIE_L'     ,
    'Est_CIE_a',
    'Est_CIE_b',
    'Est_CIE_C',
    'Est_CIE_h',
    'Especularidad',
    'Filtro_UV'
  ];  
  dataSource: MatTableDataSource<datadet> = new MatTableDataSource();

  //Para la tabla de Pivot
  displayedColumns_UP: string[] = [];
  dataSource_UP: MatTableDataSource<any> = new MatTableDataSource();

  formulario = this.formBuilder.group({
    ctrol_CodOrdTra:[''],
    ctrol_tipoMuestra:[''],
    ctrol_color:[''],
    ctrol_articulo:[''],
    ctrol_estandar:[''],
    ctrol_CanStandar:['']
  });      

  MostrarDatosPartida() {
    //event.preventDefault(); // evita que el Enter dispare el submit
    const sCodOrdTra = this.formulario.get('ctrol_CodOrdTra')?.value! || '';

    // if (!sCodOrdTra || sCodOrdTra.length !== 5) {
    //   this.formulario.get('ctrol_CodOrdTra')?.setValue('');
    //   return;
    // }

    if (!sCodOrdTra || sCodOrdTra.trim() === ''){
      this.matSnackBar.open("¡Ingrese codigo de partida...!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
    return;
    }       

    //se ejecuta cuando tiene solo 5 digitos
    if (sCodOrdTra && sCodOrdTra.length === 5) {

      this.SpinnerService.show();
      this.dataInfoPartida = [];
      this.LabColaTrabajoService.getAnalisisDelta01_ObtieneDatosxPartida(sCodOrdTra, '', '', '', 0,this.Usuario!).subscribe({
        next: (response: any) => {
          if (response.success) {
              console.log('Datos de partida', response);
            if (response.totalElements > 0) {
              this.dataInfoPartida = response.elements;

              //const xCodOrdtra = this.dataInfoPartida[0].cod_OrdTra || '';
              const xCodTela = this.dataInfoPartida[0].cod_Tela || '';
              const xCodColor = this.dataInfoPartida[0].cod_Color || '';

              this.cant_estandar = Number(this.dataInfoPartida[0].can_Standar);
              if (this.cant_estandar === 1) {
                this.colorClase = 'fondo-verde';
              } else if (this.cant_estandar !== 0) {
                this.colorClase = 'fondo-rojo';
              } else {
                this.colorClase = ''; // color normal
              }            
              this.formulario.get('ctrol_CanStandar')?.setValue(this.dataInfoPartida[0].can_Standar);  
              this.onLoadCombosGrls('2', sCodOrdTra, xCodTela, xCodColor);
              this.onLoadCombosGrls('4', sCodOrdTra, xCodTela, xCodColor);
              this.onLoadCombosGrls('5', sCodOrdTra, xCodTela, xCodColor);
              this.onLoadCombosGrls('3', sCodOrdTra, xCodTela, xCodColor);
        
              this.SpinnerService.hide();
            } else {

                this.toastr.info(response.message, '', {
                  timeOut: 2500,
                }); 

              this.cant_estandar = 0;
              this.dataInfoPartida = [];
              this.SpinnerService.hide();
            }
          } else {
        
            this.cant_estandar = 0;
            this.dataInfoPartida = [];
            this.SpinnerService.hide();

            this.toastr.info(response.message, '', {
              timeOut: 2500,
            });          
          }
        },
        error: (error: any) => {
          
          this.SpinnerService.hide();
          console.log(error.error.message, 'Cerrar', {
            timeout: 2500
          })
        }
      }); 
    } else {
        this.lstTipoMuestra = [];
        this.lstColor       = [];
        this.lstArticulo    = [];
        this.lstEstandar    = [];
        this.formulario.get('ctrol_CanStandar')?.setValue('');
    }
  }

  onLoadCombosGrls(sTipo: string, sCodOrdTra: string, sCodTela: string, sCodCombo: string){
    this.lstTipoMuestra = [];
    this.lstColor = [];
    this.lstArticulo = [];

    this.LabColaTrabajoService.getAnalisisDelta02_CombosGrles(sTipo, sCodOrdTra, sCodTela, sCodCombo, '', 0,this.Usuario!).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {

            if (sTipo == '2'){
              this.lstTipoMuestra = response.elements;
            }else if(sTipo == '4'){
              this.lstColor  = response.elements;
            }else if(sTipo == '5'){
              this.lstArticulo = response.elements;
            }else if(sTipo == '3'){
              this.lstEstandar = response.elements;
            }

            this.SpinnerService.hide();
          } else {
            this.lstTipoMuestra = [];
            this.lstColor = [];
            this.lstArticulo = [];
            this.lstEstandar = [];
            this.SpinnerService.hide();
          }
        } else {
          this.lstTipoMuestra = [];
          this.lstColor = [];
          this.lstArticulo = [];
          this.lstEstandar = [];
          this.SpinnerService.hide();

          this.toastr.info(response.message, '', {
            timeOut: 2500,
          });          
        }
      },
      error: (error: any) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', {
          timeout: 2500
        })
      }
    });
  }

  onBuscar(){

    if (this.lstTipoMuestra.length === 0){
      this.matSnackBar.open("¡Busque datos de Partida!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
      return; 
    }

    const sCodOrdTra = this.formulario.get('ctrol_CodOrdTra')?.value!;
    const sCodTela = this.formulario.get('ctrol_articulo')?.value!;
    const sCodColor = this.formulario.get('ctrol_color')?.value!;
    const sIdEstandar = Number(this.formulario.get('ctrol_estandar')?.value!);
    const sCodMotivos = this.concatenado;

    if (!this.concatenado){
      this.matSnackBar.open("¡Seleccione tipo muestra!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
      return;      
    }

    if (!sCodColor){
      this.matSnackBar.open("¡Seleccione codigo de color!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
    return;      
    }    

    if (!sCodTela){
      this.matSnackBar.open("¡Seleccione codigo de articulo!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
    return;      
    }        

    if (!sIdEstandar){
      this.matSnackBar.open("¡Seleccione codigo estandar!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
    return;      
    }       

    if (!sCodOrdTra || sCodOrdTra.trim() === ''){
      this.matSnackBar.open("¡Realice busqueda de partida...!", 'Cerrar', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 1500,
      });
    return;
    }   

    //Obtiene datos de envio de muestra
    this.onLoadEnvioMuestras(sCodOrdTra, sCodTela, sCodColor, sIdEstandar);

    //Obtiene datos de las 5 Ultimas Partidas 
    this.onLoadPartidasDespachadas(sCodOrdTra, sCodTela, sCodColor, sCodMotivos, sIdEstandar);

  }


  onLoadEnvioMuestras(sCodOrdTra: string, sCodTela: string, sCodColor: string, nStandarId: number){

    this.dataSource.data = [];
    this.SpinnerService.show();
    this.LabColaTrabajoService.getAnalisisDelta06_ObtieneMuestraStandar(sCodOrdTra, sCodTela, sCodColor, '', nStandarId, this.Usuario!).subscribe({
      next: (response: any)=> {
        if(response.success){
          if (response.totalElements > 0){
            this.dataSource.data = response.elements;
            this.SpinnerService.hide();
          }
          else{
            this.dataSource.data = [];            
            this.SpinnerService.hide();
          };
        }else{
          this.dataSource.data = [];
        }
      },  
      error: (error) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', {
        timeOut: 2500,
          });
      }          
    });       

  }

  onLoadPartidasDespachadas(sCodOrdTra: string, sCodTela: string, sCodColor: string, sCodMotivos: string, nStandarId: number){

    this.dataSource_UP.data = [];
    this.SpinnerService.show();
    this.LabColaTrabajoService.getAnalisisDelta_ObtienePartidaDespachadas(sCodOrdTra, sCodTela, sCodColor, sCodMotivos, nStandarId, this.Usuario!).subscribe({
      next: (response: any)=> {
        if(response.success){
          if (response.totalElements > 0){
            const elementos = response.elements;

            // 1. Definimos columnas solo con Bloque #1
            const elementosBloque1 = elementos.filter((d: any) => d.num_Bloque === 1);

            this.displayedColumns_UP = ['Campo'];
            const columnasMap: { [key: string]: string } = {};       
            
            elementosBloque1.forEach((d: any, index: number) => {
              const colName = `columna${index + 1}`;
              this.displayedColumns_UP.push(colName);
              columnasMap[colName] = d.Receta;
            });        

            // 2. Agrupar elementos por bloque
            const bloques = {
              1: elementos.filter((d: any) => d.num_Bloque === 1),
              2: elementos.filter((d: any) => d.num_Bloque === 2),
              3: elementos.filter((d: any) => d.num_Bloque === 3),
              4: elementos.filter((d: any) => d.num_Bloque === 4),
              5: elementos.filter((d: any) => d.num_Bloque === 5)
            };            
                        
            
            // Filas dinámicas - Bloque 1
            const filaReceta: any = { Campo: 'Receta' };
            const filaPartida: any = { Campo: 'Partida' };      
            const filaDyeLotRef: any = { Campo: 'DyelotRef' };    
            const filaProceso: any = { Campo: 'Proceso' };    
            const filaRB: any = { Campo: 'Rb' }; 
            const filaCliente: any = { Campo: 'Cliente' }; 
            const filaMaquina: any = { Campo: 'Maquina' }; 
            const filaLoteHilado: any = { Campo: 'Lote Hilado' };
            const filaFechaFinTeñido: any = { Campo: 'Fecha Fin Teñido' };

            bloques[1].forEach((d: any, index: number) => {
              const colName = `columna${index + 1}`;
              filaReceta[colName]     = d.receta;
              filaPartida[colName]    = d.partida;
              filaDyeLotRef[colName]  = d.dyelotRef;
              filaProceso[colName]    = d.proceso;
              filaRB[colName]         = d.rb;
              filaCliente[colName]    = d.cliente;
              filaMaquina[colName]    = d.maquina;
              filaLoteHilado[colName] = d.lote_Hilado;
              const fecha = new Date(d.fec_Fin_Teñido); 
              filaFechaFinTeñido[colName] = fecha.toLocaleString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            });


            // filas dinámicas para Bloque 2
            //const filasBloque2: any[] = [];

            //Filas dinamicas - Bloque 3
            const filaCIE_DL: any = { Campo: 'CIE DL' }
            const filaCIE_DA: any = { Campo: 'CIE DA' }
            const filaCIE_DB: any = { Campo: 'CIE DB' }
            const filaCMC_DE: any = { Campo: 'CMC DE' }

            bloques[3].forEach((d: any, index: number) => {
              const colName = `columna${index + 1}`;
              filaCIE_DL[colName]  = d.foR_DL == 0?'':d.foR_DL;
              filaCIE_DA[colName]  = d.foR_DA == 0?'':d.foR_DA;
              filaCIE_DB[colName]  = d.foR_DB == 0?'':d.foR_DB;
              filaCMC_DE[colName]  = d.foR_DE_2_1 == 0?'':d.foR_DE_2_1;
            });            

            //Filas dinamicas para Bloque 4
            const filaEspecularidad: any = { Campo: 'Especularidad' }
            const filaFiltroUV: any = { Campo: 'Filtro UV' }       
            
            bloques[4].forEach((d: any, index: number) => {
              const colName = `columna${index + 1}`;
              filaEspecularidad[colName] = d.especularidad;
              filaFiltroUV[colName] = d.filtro_UV;
            });                        
                
            // asignar al datasource
            this.dataSource_UP.data = [
              { Campo: 'Detalle de Partida', isTitulo: true },
              filaReceta, 
              filaPartida, 
              filaDyeLotRef, 
              filaRB, 
              filaCliente, 
              filaMaquina, 
              filaLoteHilado, 
              filaFechaFinTeñido,
              { Campo: 'Medidas Data Color', isTitulo: true },
              filaCIE_DL,
              filaCIE_DA,
              filaCIE_DB,
              filaCMC_DE,
              { Campo: 'Especificaciones Data Color', isTitulo: true },
              filaEspecularidad,
              filaFiltroUV
            ];         

            //Llamar Funcion para Crear Grafico
            this.GenerarGrafico(elementos)

            this.SpinnerService.hide();
          }
          else{
            this.dataSource_UP.data = [];            
            this.SpinnerService.hide();
          };
        }else{
          this.dataSource_UP.data = [];
        }
      },  
      error: (error) => {
        this.SpinnerService.hide();
        console.log(error.error.message, 'Cerrar', {
        timeOut: 2500,
          });
      }          
    });          

  }

  GenerarGrafico(data: any){
    console.log('generar grafico', data);
    const elementosBloque3 = data.filter((d: any) => d.num_Bloque === 3);
    const puntosBloque3 = elementosBloque3.map((d: any) => ({
      x: d.foR_DA,
      y: d.foR_DB
    }));
    console.log('generar grafico 2', puntosBloque3);
    // Asignar al dataset
    //this.scatterChartData.datasets[0].data = puntosBloque3;    
  }

  onSeleccionChange() {
    const valor = this.formulario.get('ctrol_tipoMuestra')?.value;

    // El formControl ya tiene los values seleccionados (los códigos)
    this.tipoMuestraSeleccionada = Array.isArray(valor) ? valor : [];

    // Concatenar los códigos en un string
    this.concatenado = this.tipoMuestraSeleccionada.join('|');

    console.log('this.concatenado', this.concatenado);
  }   

  onCerrar(): void {
    this.router.navigate(['/ColaTrabajo']);
  }


}
