import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../authentication/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import { Router } from '@angular/router';
import ChartDataLabels from 'chartjs-plugin-datalabels';

//Esto habilitara los plugin labels en 
//Chart.register(ChartDataLabels);


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
  bMuestraGrafico1: boolean = false;
  opcionSeleccionada: string = '01';//Opcion por defecto Partida //01=Partida, 02=Color 

  bMuestraInputPartida: boolean = true;
  bMuestraInputColor: boolean = false;


  //Variables para los graficos
  scatterChartType: 'scatter' = 'scatter';
  scatterChartOptions: ChartConfiguration<'scatter'>['options'] = {};//Cargamos en Vacio   
  scatterChartData: ChartConfiguration<'scatter'>['data'] = {
    datasets: [
      {
        label: 'Grafico CIE [DA - DB]',
        data: [],//Empir
        backgroundColor: 'blue',
        showLine: false,
        pointRadius: 5,
        pointBackgroundColor: (ctx) => {
          const point = ctx.raw as any;

          if (!point?.x && !point?.y) return 'gray';

          if (point.x > 0) return 'red';       // x+
          if (point.x < 0) return 'green';     // x-
          if (point.y > 0) return 'yellow';    // y+
          if (point.y < 0) return 'blue';      // y-

          return 'gray';
        }        
        
      }
    ]
  };  

  //Variables de los Graficos
  scatterChartOptions2: ChartConfiguration<'scatter'>['options'] = {};//Cargamos en Vacio     
  scatterChartData2: ChartConfiguration<'scatter'>['data'] = {
    datasets: [
      {
        label: 'Grafico CIE - DL',
        data: [],//Empir
        backgroundColor: 'blue',
        showLine: false,
        pointRadius: 5,
        pointBackgroundColor: (ctx) => {
          const point = ctx.raw as any;
          if (!point?.x && !point?.y) return 'gray';
          return 'gray';
        }        
        
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

    //Partida
    this.formulario.get('ctrol_CodOrdTra')?.valueChanges.subscribe((valor: any) => {
      if (valor && valor.length === 5) {
        this.MostrarDatosPartida('01');
      }
    }); 

    //Color
    this.formulario.get('ctrol_CodColor')?.valueChanges.subscribe((valor: any) => {
      if (valor && valor.length === 6) {
        this.MostrarDatosPartida('02');
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
    ctrol_tipoSeleccion :['01'],
    ctrol_CodOrdTra     :[''],
    ctrol_CodColor      :[''],
    ctrol_tipoMuestra   :[''],
    ctrol_color         :[''],
    ctrol_articulo      :[''],
    ctrol_estandar      :[''],
    ctrol_CanStandar    :['']
  });      

  MostrarDatosPartida(sTipo: string) {
    //event.preventDefault();

    //Bloque 01 --> Variables
    const sCodOrdTra = this.formulario.get('ctrol_CodOrdTra')?.value! || '';
    const sCodColor = this.formulario.get('ctrol_CodColor')?.value! || '';

    // if (!sCodOrdTra || sCodOrdTra.length !== 5) {
    //   this.formulario.get('ctrol_CodOrdTra')?.setValue('');
    //   return;
    // }

    //Bloque 02 --> Validaciones
    if (sTipo === "01"){
      if (!sCodOrdTra || sCodOrdTra.trim() === ''){
        this.matSnackBar.open("¡Ingrese codigo de partida...!", 'Cerrar', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 1500,
        });
      return;
      }    
    }else{
      if (!sCodColor || sCodColor.trim() === ''){
        this.matSnackBar.open("¡Ingrese codigo de color...!", 'Cerrar', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 1500,
        });
      return;
      }        
    }

    
    //Bloque 03 --> Reset controles
    this.tipoMuestraSeleccionada = [];
    this.concatenado = '';

    // Limpia también el FormControl asociado
    this.formulario.get('ctrol_tipoMuestra')?.reset();      
    this.formulario.get('ctrol_color')?.reset(); 
    this.formulario.get('ctrol_articulo')?.reset(); 
    this.formulario.get('ctrol_estandar')?.reset();     
   
    //Bloque 04 --> Obtener Informacion segun Tipo (Partida ó Color)
    //Bloque 04.01 --> Partida
    if (sTipo === "01"){

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
                const xCodTela  = this.dataInfoPartida[0].cod_Tela || '';
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
          
                //this.SpinnerService.hide();
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

          this.dataSource.data = [];
          this.dataSource_UP.data = [];

          this.bMuestraGrafico1 = false;
          this.formulario.get('ctrol_CanStandar')?.setValue('');
      }
    };
    
    //Bloque 04.02 --> Color
    if (sTipo === "02"){    
  
      //se ejecuta cuando tiene solo 6 digitos
      if (sCodColor && sCodColor.length === 6) {

        this.SpinnerService.show();
        this.dataInfoPartida = [];    

        this.onLoadCombosGrls_Color("A","","",sCodColor);
        this.onLoadCombosGrls_Color("B","","",sCodColor);

      } else {
          this.lstTipoMuestra = [];
          this.lstColor       = [];
          this.lstArticulo    = [];
          this.lstEstandar    = [];

          this.dataSource.data = [];
          this.dataSource_UP.data = [];

          this.bMuestraGrafico1 = false;
          this.formulario.get('ctrol_CanStandar')?.setValue('');
      }      

    }
  }

  onLoadCombosGrls_Color(sTipo: string, sCodOrdTra: string, sCodTela: string, sCodCombo: string){

    if (sTipo == 'A'){
      this.lstColor  = [];
    }else if(sTipo == 'B'){
      this.lstArticulo = [];
    }else if(sTipo == 'C'){
      this.lstTipoMuestra = [];
    }else if(sTipo == 'E'){
      this.lstEstandar = [];
    }

    this.SpinnerService.show();
    this.LabColaTrabajoService.getAnalisisDelta02_CombosGrles(sTipo, sCodOrdTra, sCodTela, sCodCombo, '', 0,this.Usuario!).subscribe({
      next: (response: any) => {
        if (response.totalElements > 0) {
          if (sTipo == 'A'){
            this.lstColor  = response.elements;
          }else if(sTipo == 'B'){
            this.lstArticulo = response.elements;
          }else if(sTipo == 'C'){
            this.lstTipoMuestra = response.elements;
          }else if(sTipo == 'E'){
            this.lstEstandar = response.elements;
          }      
          this.SpinnerService.hide();     
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

  onLoadCombosGrls(sTipo: string, sCodOrdTra: string, sCodTela: string, sCodCombo: string){

    if (sTipo == '2'){
      this.lstTipoMuestra = [];
    }else if(sTipo == '4'){
      this.lstColor  = [];
    }else if(sTipo == '5'){
      this.lstArticulo = [];
    }else if(sTipo == '3'){
      this.lstEstandar = [];
    }    

    this.SpinnerService.show();
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

    if (this.opcionSeleccionada == '01'){
      if (this.lstTipoMuestra.length === 0){
        this.matSnackBar.open("¡Busque datos de Partida!", 'Cerrar', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 1500,
        });
        return; 
      }
    }else{
      if (this.lstTipoMuestra.length === 0){
        this.matSnackBar.open("¡Busque datos de Color!", 'Cerrar', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 1500,
        });
        return; 
      }      
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

    // if (!sCodOrdTra || sCodOrdTra.trim() === ''){
    //   this.matSnackBar.open("¡Realice busqueda de partida...!", 'Cerrar', {
    //     horizontalPosition: 'center',
    //     verticalPosition: 'top',
    //     duration: 1500,
    //   });
    // return;
    // }   

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
    //oculta grafico
    this.bMuestraGrafico1 = false;
    this.dataSource_UP.data = [];
    this.SpinnerService.show();
    this.LabColaTrabajoService.getAnalisisDelta_ObtienePartidaDespachadas(sCodOrdTra, sCodTela, sCodColor, sCodMotivos, nStandarId, this.Usuario!).subscribe({
      next: (response: any)=> {
        if(response.success){
          if (response.totalElements > 0){
            const elementos = response.elements;

            console.log('onLoadPartidasDespachadas', elementos);

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
            
            //Ordamos
            const bloque2Ordenado = [...bloques[2]].sort((a: any, b: any) => {

              if (a.num_Orden !== b.num_Orden) {
                return (a.num_Orden || 0) - (b.num_Orden || 0);
              }

              return (a.nom_Colorante_1 || '').localeCompare(b.nom_Colorante_1 || '');
            });

            // 1️⃣ Obtener partidas (columnas)
            const partidas = bloques[1].map((x: any) => x.partida);

            // 2️⃣ Estructura de filas
            const filasColorantes: any = {};    
            
            // 3️⃣ Recorrer bloque 2
            bloque2Ordenado.forEach((d: any) => {

              if (!d.nom_Colorante_1) return;

              const nombre = d.nom_Colorante_1;
              const partida = d.partida;

              // buscar columna correcta
              const colIndex = partidas.indexOf(partida);
              if (colIndex === -1) return;

              const colName = `columna${colIndex + 1}`;

              // crear fila si no existe
              if (!filasColorantes[nombre]) {
                filasColorantes[nombre] = { Campo: nombre };
              }

              // asignar valor
              filasColorantes[nombre][colName] =
                d.can_Colorante_1 == 0 ? '' : d.can_Colorante_1;

            });       
            
            const filasBloque2 = Object.values(filasColorantes);

            /*
            const seen = new Set();
            const filasBloquex : any[] = [];

            bloque2Ordenado.forEach((d: any) => {
              if (!d.nom_Colorante_1) return;

              // clave única
              const key = `${d.nom_Colorante_1}`;  
              console.log('key', key)
              
              // validar si ya existe
              if (seen.has(key)) return;        
              
              seen.add(key);

              filasBloquex.push({
                Campo: d.nom_Colorante_1
              });              

            });
            */

            
            // const filasBloque2 = bloques[2]
            //   .filter((d: any) => d.nom_Colorante_1) // quitar NULL
            //   .map((d: any) => ({
            //     Campo: d.nom_Colorante_1
            //   }));

            //
            
            

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
            
            //FILAS dinamicas para bloque 5
            const filaCalTono: any = { Campo: 'Calificación Tono' }
            const filaObsInsCal: any = { Campo: 'Observación Insp. Calidad' }

            bloques[5].forEach((d: any, index: number) => {
              const colName = `columna${index + 1}`;
              filaCalTono[colName] = d.calificacion_Tono;
              filaObsInsCal[colName] = d.observacion;
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
              { Campo: 'Trigomia de Colorante', isTitulo: true },
              ...filasBloque2,
              { Campo: 'Medidas Data Color', isTitulo: true },
              filaCIE_DL,
              filaCIE_DA,
              filaCIE_DB,
              filaCMC_DE,
              { Campo: 'Especificaciones Data Color', isTitulo: true },
              filaEspecularidad,
              filaFiltroUV,
              { Campo: 'Resultado Calidad', isTitulo: true },
              filaCalTono,
              filaObsInsCal
            ];         

            //Llamar Funcion para Crear Grafico
            this.GenerarGrafico(elementos);

            //Llamar Funcion para crear Grafico 2
            this.GenerarGrafico2(elementos);

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

  GenerarGrafico2(data: any){

    const elementosBloque3 = data.filter((d: any) => d.num_Bloque === 3);
    const puntosBloque3 = elementosBloque3.map((d: any) => ({
      x: 0,
      y: d.foR_DL
    }));

    const ys = puntosBloque3.map((p:any) => p.y);
    const maxAbsY = Math.max(...ys.map((y:any) => Math.abs(y)));
    const padding = 0.2;

    this.scatterChartOptions2 = {
      ...this.scatterChartOptions2,
      responsive: true,
      // plugins: {
      //   datalabels: {
      //     align: (ctx) => {
      //       // alterna derecha/izquierda según el índice del punto
      //       return ctx.dataIndex % 2 === 0 ? 'right' : 'left';
      //     },
      //     anchor: 'end',
      //     formatter: (value, ctx) => {
      //       // value es {x, y}
      //       return `(${value.y.toFixed(2)})`;
      //     },
      //     color: 'black',
      //     font: {
      //       size: 10
      //     }
      //   }
      // },        
      scales: {
            x: {
              type: 'linear',
              min: -0.5,
              max: 0.5,
              title: { display: true, text: 'ΔL' },
              grid: {
                color: (ctx) => ctx.tick.value === 0 ? 'black' : '#e0e0e0',
                lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
              }
            },
            y: {
              type: 'linear',
              min: -(maxAbsY + padding),   // 👈 simétrico hacia abajo
              max:  (maxAbsY + padding),   // 👈 simétrico hacia arriba
              title: { display: true, text: '' },
              // grid: {
              //   color: (ctx) => ctx.tick.value === 0 ? 'black' : '#e0e0e0',
              //   lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
              // }
            }
      }
    };  

    // Asignar al dataset principal
    this.scatterChartData2 = {
      datasets: [
        {
          label: 'Grafico CIE - DL',
          data: puntosBloque3,
          backgroundColor: 'blue',
          pointRadius: 5,
          showLine: false
        }
      ]
    };

    // Refrescar
    this.scatterChartData2 = { ...this.scatterChartData2 };
    this.scatterChartOptions2 = { ...this.scatterChartOptions2 };

  }

  GenerarGrafico(data: any){

    const elementosBloque3 = data.filter((d: any) => d.num_Bloque === 3);
    const puntosBloque3 = elementosBloque3.map((d: any) => ({
      x: d.foR_DA,
      y: d.foR_DB
    }));

    //Calculamos las escalas dinamicamente 
    const xs = puntosBloque3.map((p:any) => p.x);
    const ys = puntosBloque3.map((p:any) => p.y);   
    
    // obtener el valor más extremo en ambos lados
    const maxAbsX = Math.max(...xs.map((x:any) => Math.abs(x)));
    const maxAbsY = Math.max(...ys.map((y:any) => Math.abs(y)));    

    //const padding = 3;
    
    // Tomamos el mayor entre X y Y
    const maxAbs = Math.max(maxAbsX, maxAbsY);

    // Redondeamos al entero superior y sumamos 0.5
    const limite = Math.ceil(maxAbs) + 0.5;

    this.scatterChartOptions = {
      ...this.scatterChartOptions,
      // plugins: {
      //   datalabels: {
      //     align: 'right',
      //     anchor: 'end',
      //     formatter: (value, ctx) => {
      //       // value es {x, y}
      //       return `(${value.x}, ${value.y.toFixed(2)})`;
      //     },
      //     color: 'black',
      //     font: {
      //       size: 10
      //     }
      //   }
      // },      
      scales: {
        x: { 
              type: 'linear',
              position: 'bottom',
              min: -limite,
              max: limite,
              ticks: {
                stepSize: 0.5 // 👈 incrementos de 0.5
              },
              title: { display: true, text: 'Δa' },
              grid: {
                color: (ctx) => ctx.tick.value === 0 ? 'black' : '#e0e0e0',
                lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
              }            
            },
        y: { 
              type: 'linear',
              min: -limite,
              max: limite,
              ticks: {
                stepSize: 0.5 // 👈 incrementos de 0.5
              },
              title: { display: true, text: 'Δb' },
              grid: {
                color: (ctx) => ctx.tick.value === 0 ? 'black' : '#e0e0e0',
                lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
              }            
            }
      }
    };

    // Asignar al dataset 
    this.scatterChartData.datasets[0].data = puntosBloque3;    

    //Refrescamos dataset
    this.scatterChartData = { ...this.scatterChartData };    
    this.scatterChartOptions = { ...this.scatterChartOptions };

    //mostramos el grafico
    this.bMuestraGrafico1 = true;
  }

  onSeleccionChange() {
    const valor = this.formulario.get('ctrol_tipoMuestra')?.value;

    // El formControl ya tiene los values seleccionados (los códigos)
    this.tipoMuestraSeleccionada = Array.isArray(valor) ? valor : [];

    // Concatenar los códigos en un string
    this.concatenado = this.tipoMuestraSeleccionada.join('|');
  }  
  
  onSeleccionChangeArticulo() {
    const sCodTela = this.formulario.get('ctrol_articulo')?.value!;
    const sCodColor = this.formulario.get('ctrol_color')?.value!;    
    //Aplica solo cuando es Tipo Color
    if(this.opcionSeleccionada == '02'){
        this.onLoadCombosGrls_Color("C","",sCodTela,sCodColor);
        this.onLoadCombosGrls_Color("E","",sCodTela,sCodColor);
    }
  }

  onCerrar(): void {
    this.router.navigate(['/ColaTrabajo']);
  }

  capturarValor(event: any) {
    //Captura el valor en Variable Gral
    this.opcionSeleccionada = String(event.value); 

    if(String(event.value) == '01'){
      this.formulario.get('ctrol_CodOrdTra')?.setValue(''); 
      this.bMuestraInputPartida = true;
      this.bMuestraInputColor = false;
    }else{
      this.formulario.get('ctrol_CodColor')?.setValue(''); 
      this.bMuestraInputPartida = false;
      this.bMuestraInputColor = true;      
    }
  }


}
