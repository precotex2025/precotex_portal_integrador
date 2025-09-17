import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card'; 
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule }  from '@angular/material/datepicker'; 
//import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatTableModule } from '@angular/material/table'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSidenavModule} from '@angular/material/sidenav';
import { MatRadioModule} from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule} from '@angular/material/divider'
import { MatTabsModule} from '@angular/material/tabs';
import { MatListModule} from '@angular/material/list'; 
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule ({
    imports: [
        MatButtonModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        MatSnackBarModule, 
        MatToolbarModule,
        MatFormFieldModule,
        MatMenuModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatDatepickerModule,
        //MatMomentDateModule,
        MatCheckboxModule,
        MatTableModule,
        MatButtonToggleModule,
        MatSelectModule, 
        MatSortModule,
        MatAutocompleteModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSidenavModule,
        MatRadioModule,
        MatDividerModule,
        MatTabsModule,
        MatListModule,
        MatTooltipModule,
        MatGridListModule
    ],
    exports:[
        MatButtonModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatMenuModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatDatepickerModule,
       // MatMomentDateModule,
        MatCheckboxModule,
        MatTableModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatSortModule,
        MatAutocompleteModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSidenavModule,
        MatRadioModule,
        MatDividerModule,
        MatTabsModule,
        MatListModule,
        MatGridListModule
    ]
})

export class MaterialModule{}