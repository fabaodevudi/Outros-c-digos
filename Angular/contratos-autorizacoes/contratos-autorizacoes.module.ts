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
import { AutorizacaoDialogComponent } from "./autorizacoes/autorizacao-dialog/autorizacao-dialog.component";
import { AutorizacaoVisualizacaoComponent } from "./autorizacoes/autorizacao-visualizacao/autorizacao-visualizacao.component";
import { AutorizacoesComponent } from "./autorizacoes/autorizacoes.component";
import { AutorizacoesService } from "./autorizacoes/autorizacoes.service";
import { ContratosAutorizacoesRoutingModule } from "./contratos-autorizacoes-routing.module";
import { ContratosAutorizacoesComponent } from "./contratos-autorizacoes.component";
import { ContratosAutorizacoesService } from "./contratos-autorizacoes.service";
import { ContratoDialogComponent } from "./contratos/contrato-dialog/contrato-dialog.component";
import { ContratoVisualizacaoComponent } from "./contratos/contrato-visualizacao/contrato-visualizacao.component";
import { ContratosComponent } from "./contratos/contratos.component";
import { UploadDocumentosComponent } from "./upload-documentos/upload-documentos.component";
import { UploadDocumentosService } from "./upload-documentos/upload-documentos.service";

@NgModule({
  declarations: [
    ContratosAutorizacoesComponent,
    ContratosComponent,
    AutorizacoesComponent,
    AutorizacaoDialogComponent,
    ContratoDialogComponent,
    UploadDocumentosComponent,
    ContratoVisualizacaoComponent,
    AutorizacaoVisualizacaoComponent,
  ],
  entryComponents: [
    ContratoDialogComponent,
    AutorizacaoDialogComponent,
  ],
  exports: [
    ContratosAutorizacoesRoutingModule,
  ],
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
    NgxUiLoaderModule,
    NgxDropzoneModule,
    ContratosAutorizacoesRoutingModule,
  ],
  providers: [ContratosAutorizacoesService, UploadDocumentosService, AutorizacoesService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ContratosAutorizacoesModule {}
