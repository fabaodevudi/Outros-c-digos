import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Component, Inject, Input, NgZone, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import "core-js/es/array";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Observable, Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { CustomValidators } from "src/app/shared/custom-validators";
import { IAutorizacao, IAutorizacaoPost } from "src/app/shared/model/autorizacao";
import { IDocumentoPrestacaoContas } from "src/app/shared/model/documentos-prestacao-contas";
import { IDespesa, IGrupo, IGruposData, ISubgrupo } from "src/app/shared/model/grupo-despesa-mensal";
import { IServentia } from "src/app/shared/model/serventia";
import { UtilsService } from "src/app/shared/utils.service";
import { AutorizacoesService } from "../autorizacoes.service";

export interface IDadosAutorizacaoDialogData {
  autorizacao?: IAutorizacao;
}

export interface IMeses {
  id?: number;
  descricao?: string;
}
@Component({
  selector: "app-autorizacao-dialog",
  styleUrls: ["./autorizacao-dialog.component.css"],
  templateUrl: "./autorizacao-dialog.component.html",
})
export class AutorizacaoDialogComponent implements OnInit {

  public autorizacao: IAutorizacao;
  public serventia: IServentia;
  public documentos: IDocumentoPrestacaoContas[] = [];
  public grupos: IGrupo[] = [];
  public subgrupos: ISubgrupo[] = [];
  public despesas: IDespesa[] = [];

  public formAutorizacao: FormGroup;
  public formDocumento: FormGroup;
  public formConfirmacao: FormGroup;
  public dataInicio: FormControl = new FormControl();

  public nomeGrupo: string = this.data.autorizacao.grupo ? this.data.autorizacao.grupo.descricao : "Grupo";
  public nomeSubgrupo: string = this.data.autorizacao.subgrupo ? this.data.autorizacao.subgrupo.descricao : "Subgrupo";
  public nomeDespesa: string = this.data.autorizacao.despesaMensal ? this.data.autorizacao.despesaMensal.descricao : "Despesa";
  @ViewChild("autosize") public autosize: CdkTextareaAutosize;

  constructor(public dialogRef: MatDialogRef<IAutorizacao>,
              private ngZone: NgZone,
              private fb: FormBuilder,
              private ngxLoader: NgxUiLoaderService,
              private serv: AutorizacoesService,
              private utils: UtilsService,
              @Inject(MAT_DIALOG_DATA) public data: IDadosAutorizacaoDialogData,
  ) {
    this.autorizacao = { ...data?.autorizacao };
    this.loadGrupos();
  }

  public criaFormulario(autorizacao: IAutorizacao): void {
    this.formAutorizacao = this.formAutorizacao = this.fb.group({
      dataInicio: [autorizacao.dataInicio != null ? new Date(autorizacao.dataInicio) : null, Validators.required],
      despesa: [autorizacao.despesaMensal, Validators.required],
      grupo: [autorizacao.grupo, Validators.required],
      identificador: [{ value: autorizacao.identificador, disabled: this.isEdicao() },
              [Validators.required, CustomValidators.validaEspacoVazio]],
      observacao: [autorizacao.observacao],
      subgrupo: [autorizacao.subgrupo, Validators.required],
    }) as FormGroup;
  }

  public loadGrupos(): void {
    this.serv.getGrupos().subscribe((res: IGruposData) => {
      this.grupos = res.data.grupoDespesaMensal;
    });
  }

  public ngOnInit(): void {
    this.serventia = this.serv.getServentiaSelecionada();
    this.criaFormulario(this.autorizacao);
    this.formAutorizacao.get("grupo").valueChanges.subscribe((data) => {
      if (this.grupos.find((g: IGrupo) => g === data)) {
        this.subgrupos = this.grupos.find((g: IGrupo) => g === data).subgrupo;
      } else {
        this.subgrupos = [];
      }
    });
    this.formAutorizacao.get("subgrupo").valueChanges.subscribe((data) => {
      if (this.subgrupos.find((s: ISubgrupo) => s === data)) {
        this.despesas = this.subgrupos.find((s: ISubgrupo) => s === data).despesas;
      } else {
        this.despesas = [];
      }
    });

  }

  public getFormulario(): IAutorizacao {
    const inicial = this.formAutorizacao.controls.dataInicio.value ? new Date(this.formAutorizacao.controls.dataInicio.value) : null;

    return {
      dataInicio: inicial ? new Date(inicial.getFullYear(), inicial.getMonth(), 1, 0, 0, 0, 0) : null,
      despesaMensal: this.formAutorizacao.controls.despesa.value,
      grupo: this.formAutorizacao.controls.grupo.value,
      identificador: this.formAutorizacao.controls.identificador.value,
      observacao: this.formAutorizacao.controls.observacao.value,
      subgrupo: this.formAutorizacao.controls.subgrupo.value,
    } as IAutorizacao;
  }

  public triggerResize(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public isEdicao(): boolean {
    return this.autorizacao.id != null ? true : false;
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public podeEditar(docsExcluir: IDocumentoPrestacaoContas[], docsAdicionar: IDocumentoPrestacaoContas[]): boolean {
    let can: boolean;
    can = this.formAutorizacao.touched || docsExcluir.length > 0 || docsAdicionar.length > 0;
    return can;
  }

  public salvar(): void {
    let autorizacao: IAutorizacao;
    autorizacao = this.getFormulario();
    autorizacao.serventia = this.serventia;

    const dataInicio: number = this.formAutorizacao.value.dataInicio instanceof Date
      ? this.formAutorizacao.value.dataInicio.getTime()
      : this.formAutorizacao.value.dataInicio.toDate().getTime();

    const params = {
      dataInicio,
      despesaMensal: autorizacao.despesaMensal,
      idServentia: autorizacao.serventia.idServentia,
      identificador: autorizacao.identificador,
      observacao: autorizacao.observacao,
    } as IAutorizacaoPost;

    const documentosExcluir: IDocumentoPrestacaoContas[] = this.documentos.filter(
      (d: IDocumentoPrestacaoContas) => d.idDocumento !== null && d.adicionar === false && d.file == null,
    );

    const documentosAdicionar: IDocumentoPrestacaoContas[] = this.documentos.filter(
      (d: IDocumentoPrestacaoContas) => d.idDocumento === null && d.file != null,
    );

    const documentos: IDocumentoPrestacaoContas[] = documentosExcluir.concat(documentosAdicionar);

    let call: Observable<void>;
    if (this.isEdicao()) {
      if (this.autorizacao.glosado !== "T" || this.podeEditar(documentosExcluir, documentosAdicionar)) {
        call = this.serv
          .editAutorizacao(
            this.autorizacao.id,
            params,
            documentos,
          );
      } else {
        this.utils.showDialogMessage("Esta autorização está glosada, " +
              "portanto seus dados devem ser alterados ou uma justificativa " +
              "adicionada no campo observação para que uma nova análise seja realizada.");
      }
    } else {
      call = this.serv
        .postAutorizacao(
          params,
          documentosAdicionar,
        );
    }

    if (call != null) {
      this.ngxLoader.startLoader("loaderAutorizacao");
      call.subscribe((success: void) => {
        this.ngxLoader.stopLoader("loaderAutorizacao");
        this.utils.showDialogMessage("Autorização salva com sucesso!");
        this.dialogRef.close(true);
      }, (error: HttpErrorResponse) => {
        this.ngxLoader.stopLoader("loaderAutorizacao");
        this.utils.showDialogError(error);
      });
    }

  }

  public setDocumentos(value: IDocumentoPrestacaoContas[]): void {
    this.documentos = value;
  }

  public isCompleteDocs(): boolean {
    return ( // adicionar

      (this.documentos.filter((d) => !d.idDocumento && d.adicionar === true).length === 1)
      // substituir
      // tslint:disable-next-line: max-line-length
      || (this.documentos.filter((d) => d.idDocumento && d.adicionar === false || !d.idDocumento && d.adicionar === true).length === 2)
      // sem modificar
      // tslint:disable-next-line: max-line-length
      || (this.documentos.filter((d) => d.idDocumento && (d.adicionar === null || d.adicionar === undefined)).length === 1)
    );

  }

}
