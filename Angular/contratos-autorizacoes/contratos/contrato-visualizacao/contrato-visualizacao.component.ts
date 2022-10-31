import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { formatCurrency } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, NgZone, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { take } from "rxjs/operators";
import { ContratosAutorizacoesService } from "src/app/contratos-autorizacoes/contratos-autorizacoes.service";
import { UploadDocumentosService } from "src/app/contratos-autorizacoes/upload-documentos/upload-documentos.service";
import { IContrato } from "src/app/shared/model/contratos";
import { IDocumentoPrestacaoContas, IDocumentoPrestacaoContasData } from "src/app/shared/model/documentos-prestacao-contas";
import { IMotivoGlosa,  IMotivoGlosaData } from "src/app/shared/model/motivo-glosa";
import { UtilsService } from "src/app/shared/utils.service";
import { IMeses } from "../contrato-dialog/contrato-dialog.component";

export interface IDadosContratoDialogData {
  contrato?: IContrato;
  isAditivo: boolean;
}

@Component({
  selector: "app-contrato-visualizacao",
  styleUrls: ["./contrato-visualizacao.component.css"],
  templateUrl: "./contrato-visualizacao.component.html",
})

export class ContratoVisualizacaoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ContratoVisualizacaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDadosContratoDialogData,
    private ngZone: NgZone,
    private servDocumento: UploadDocumentosService ,
    private service: ContratosAutorizacoesService ,
    private ngxLoader: NgxUiLoaderService,
    private utils: UtilsService) {
    this.contrato = { ...data.contrato};
    this.mesCompetencia = this.meses.find((item) => item.id === this.contrato.competenciaCorrecao);

  }

  public contrato: IContrato;

  @ViewChild("autosize") public autosize: CdkTextareaAutosize;

  public grupo: string = this.data.contrato.grupo.descricao;
  public subgrupo: string = this.data.contrato.subgrupo.descricao;
  public despesa: string = this.data.contrato.despesaMensal.descricao;

  public listaMotivosGlosa: IMotivoGlosa[] = [];

  public meses: IMeses[] = [
    { id: 1, descricao: "Janeiro" },
    { id: 2, descricao: "Fevereiro" },
    { id: 3, descricao: "Março" },
    { id: 4, descricao: "Abril" },
    { id: 5, descricao: "Maio" },
    { id: 6, descricao: "Junho" },
    { id: 7, descricao: "Julho" },
    { id: 8, descricao: "Agosto" },
    { id: 9, descricao: "Setembro" },
    { id: 10, descricao: "Outubro" },
    { id: 11, descricao: "Novembro" },
    { id: 12, descricao: "Dezembro" },
  ];

  public mesCompetencia: IMeses = {};
  public indices: string[];
  public documentos: IDocumentoPrestacaoContas[] = [];
  public mode = "determinate";

  public loadDocumentos(): void {
    this.ngxLoader.startLoader("loaderContratoVisualizacao");
    this.servDocumento.getDocumentosContrato(this.contrato.id).subscribe((res: IDocumentoPrestacaoContasData) => {
      this.ngxLoader.stopLoader("loaderContratoVisualizacao");
      this.documentos = res.data;
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderContratoVisualizacao");
      this.utils.showDialogError(error);
    });
  }

  public getMotivosGlosa(): void {
    this.ngxLoader.startLoader("loaderContratoVisualizacao");
    this.service.getMotivosGlosa(this.contrato.id).subscribe((res: IMotivoGlosaData) => {
      this.ngxLoader.stopLoader("loaderContratoVisualizacao");
      this.listaMotivosGlosa = Array.from(res.data);
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderContratoVisualizacao");
      this.utils.showDialogError(error);
    });
  }

  public getSituacao(): string {
    if (this.contrato.glosado === "N") {
      return "Não analisado";
    } else if (this.contrato.glosado === "T") {
      return "Glosado";
    } else if (this.contrato.glosado === "V") {
      return "Validado";
    }
  }

  public fechar(): void {
    this.dialogRef.close();
  }

  public ngOnInit(): void {
    this.loadDocumentos();
    this.getMotivosGlosa();
  }

  public formataValor(valor: number): string {
    return formatCurrency(valor, "pt", "", "BRL");
  }

  public triggerResize(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public onDownload(documento: IDocumentoPrestacaoContas): void {
    this.ngxLoader.startLoader("loaderContratoVisualizacao");
    const idx = this.documentos.indexOf(documento);
    if (documento.idDocumento !== null) {
      this.servDocumento.getDocumento(documento).subscribe((response) => {
        const contentDisposition = response.headers.get("content-disposition") || "";
        const matches = /filename=([^;]+)/gi.exec(contentDisposition);
        const fileName = matches[1] ? matches[1].slice(1, -1).trim() : "untitled";
        this.mode = "determinate";
        this.documentos[idx].progress = 100;
        this.ngxLoader.stopLoader("loaderContratoVisualizacao");
        saveAs(response.body, fileName);
      }, (error: HttpErrorResponse) => {
        this.ngxLoader.stopLoader("loaderContratoVisualizacao");
        this.documentos[idx].progress = 0;
        this.utils.showDialogMessage("Erro ao recuperar o arquivo com o ID " + documento.idDocumento + ".");
      });
    } else {
      saveAs(documento.file);
    }
  }

}
