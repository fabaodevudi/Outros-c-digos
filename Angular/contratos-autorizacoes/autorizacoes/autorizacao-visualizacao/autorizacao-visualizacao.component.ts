import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, NgZone, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { take } from "rxjs/operators";
import { UploadDocumentosService } from "src/app/contratos-autorizacoes/upload-documentos/upload-documentos.service";
import { IAutorizacao } from "src/app/shared/model/autorizacao";
import { IDocumentoPrestacaoContas, IDocumentoPrestacaoContasData } from "src/app/shared/model/documentos-prestacao-contas";
import { IMotivoGlosa, IMotivoGlosaData } from "src/app/shared/model/motivo-glosa";
import { UtilsService } from "src/app/shared/utils.service";
import { AutorizacoesService } from "../autorizacoes.service";

export interface IDadosAutorizacaoDialogData {
  autorizacao?: IAutorizacao;
}

@Component({
  selector: "app-autorizacao-visualizacao",
  styleUrls: ["./autorizacao-visualizacao.component.css"],
  templateUrl: "./autorizacao-visualizacao.component.html",
})

export class AutorizacaoVisualizacaoComponent implements OnInit {
  public autorizacao: IAutorizacao;
  constructor(
    public dialogRef: MatDialogRef<AutorizacaoVisualizacaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDadosAutorizacaoDialogData,
    private ngZone: NgZone,
    private servDocumento: UploadDocumentosService ,
    private service: AutorizacoesService ,
    private ngxLoader: NgxUiLoaderService,
    private utils: UtilsService) {
    this.autorizacao = { ...data.autorizacao};
  }

  @ViewChild("autosize") public autosize: CdkTextareaAutosize;

  public grupo: string = this.data.autorizacao.grupo.descricao;
  public subgrupo: string = this.data.autorizacao.subgrupo.descricao;
  public despesa: string = this.data.autorizacao.despesaMensal.descricao;

  public listaMotivosGlosa: IMotivoGlosa[] = [];

  public documentos: IDocumentoPrestacaoContas[] = [];
  public mode = "determinate";

  public loadDocumentos(): void {
    this.ngxLoader.startLoader("loaderAutorizacaoVisualizacao");
    this.servDocumento.getDocumentosAutorizacao(this.autorizacao.id).subscribe((res: IDocumentoPrestacaoContasData) => {
      this.ngxLoader.stopLoader("loaderAutorizacaoVisualizacao");
      this.documentos = res.data;
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderAutorizacaoVisualizacao");
      this.utils.showDialogError(error);
    });
  }

  public getMotivosGlosa(): void {
    this.ngxLoader.startLoader("loaderAutorizacaoVisualizacao");
    this.service.getMotivosGlosa(this.autorizacao.id).subscribe((res: IMotivoGlosaData) => {
      this.ngxLoader.stopLoader("loaderAutorizacaoVisualizacao");
      this.listaMotivosGlosa = Array.from(res.data);
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderAutorizacaoVisualizacao");
      this.utils.showDialogError(error);
    });
  }

  public fechar(): void {
    this.dialogRef.close();
  }

  public ngOnInit(): void {
    this.loadDocumentos();
    this.getMotivosGlosa();
  }

  public triggerResize(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public onDownload(documento: IDocumentoPrestacaoContas): void {
    this.ngxLoader.startLoader("loaderAutorizacaoVisualizacao");
    const idx = this.documentos.indexOf(documento);
    if (documento.idDocumento !== null) {
      this.servDocumento.getDocumento(documento).subscribe((response) => {
        const contentDisposition = response.headers.get("content-disposition") || "";
        const matches = /filename=([^;]+)/gi.exec(contentDisposition);
        const fileName = matches[1] ? matches[1].slice(1, -1).trim() : "untitled";
        this.mode = "determinate";
        this.documentos[idx].progress = 100;
        this.ngxLoader.stopLoader("loaderAutorizacaoVisualizacao");
        saveAs(response.body, fileName);
      }, (error: HttpErrorResponse) => {
        this.ngxLoader.stopLoader("loaderAutorizacaoVisualizacao");
        this.documentos[idx].progress = 0;
        this.utils.showDialogMessage("Erro ao recuperar o arquivo com o ID " + documento.idDocumento + ".");
      });
    } else {
      saveAs(documento.file);
    }
  }

}
