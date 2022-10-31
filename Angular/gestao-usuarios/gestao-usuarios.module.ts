import { LayoutModule } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxDropzoneModule } from "ngx-dropzone";
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { AngularMaterialModule } from "../shared/angular-material.module";
import { FiltroUsuariosComponent } from "./filtro-usuarios/filtro-usuarios.component";
import { GestaoPerfisModalComponent } from "./gestao-perfis-modal/gestao-perfis-modal.component";
import { GestaoServentiasModalComponent } from "./gestao-serventias-modal/gestao-serventias-modal.component";
import { GestaoUsuariosRoutingModule } from "./gestao-usuarios-routing.module";
import { GestaoUsuariosComponent } from "./gestao-usuarios.component";

@NgModule({
  declarations: [FiltroUsuariosComponent, GestaoUsuariosComponent, GestaoPerfisModalComponent, GestaoServentiasModalComponent],
  entryComponents: [],
  exports: [GestaoUsuariosRoutingModule],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    FlexLayoutModule,
    LayoutModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    HttpClientModule,
    GestaoUsuariosRoutingModule,
    NgxUiLoaderModule,
    NgxDropzoneModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GestaoUsuariosModule {}
