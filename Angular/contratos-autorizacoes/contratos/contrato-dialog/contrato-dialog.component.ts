import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { formatCurrency } from "@angular/common";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Component, Inject, Input, NgZone, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import "core-js/es/array";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Observable} from "rxjs";
import { take } from "rxjs/operators";
import { ContratosAutorizacoesService } from "src/app/contratos-autorizacoes/contratos-autorizacoes.service";
import { CustomValidators } from "src/app/shared/custom-validators";
import { IContrato, IContratoPost } from "src/app/shared/model/contratos";
import { IDocumentoPrestacaoContas } from "src/app/shared/model/documentos-prestacao-contas";
import { IDespesa, IGrupo, IGruposData, ISubgrupo } from "src/app/shared/model/grupo-despesa-mensal";
import { IIndiceCorrecao, IIndiceCorrecaoData } from "src/app/shared/model/indice-correcao";
import { IServentia } from "src/app/shared/model/serventia";
import { UtilsService } from "src/app/shared/utils.service";
export interface IDadosContratoDialogData {
  contrato?: IContrato;
  isAditivo: boolean;
}

export interface IMeses {
  id?: number;
  descricao?: string;
}
@Component({
  selector: "app-contrato-dialog",
  styleUrls: ["./contrato-dialog.component.css"],
  templateUrl: "./contrato-dialog.component.html",
})
export class ContratoDialogComponent implements OnInit {

  public contrato: IContrato;
  public serventia: IServentia;
  public documentos: IDocumentoPrestacaoContas[] = [];
  public grupos: IGrupo[] = [];
  public subgrupos: ISubgrupo[] = [];
  public despesas: IDespesa[] = [];
  public indices: IIndiceCorrecao[] = [];
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
  public isAditivo: boolean;
  public formContrato: FormGroup;
  public formVigencia: FormGroup;
  public formDocumento: FormGroup;
  public formConfirmacao: FormGroup;

  public dataInicio: FormControl = new FormControl();
  public dataTermino: FormControl = new FormControl();

  public isDocumentosTouched = false;

  public nomeGrupo: string = this.data.contrato.grupo ? this.data.contrato.grupo.descricao : "Grupo";
  public nomeSubgrupo: string = this.data.contrato.subgrupo ? this.data.contrato.subgrupo.descricao : "Subgrupo";
  public nomeDespesa: string = this.data.contrato.despesaMensal ? this.data.contrato.despesaMensal.descricao : "Despesa";
  @ViewChild("autosize") public autosize: CdkTextareaAutosize;

  constructor(public dialogRef: MatDialogRef<ContratoDialogComponent>,
              private ngZone: NgZone,
              private fb: FormBuilder,
              private ngxLoader: NgxUiLoaderService,
              private serv: ContratosAutorizacoesService,
              private utils: UtilsService,
              @Inject(MAT_DIALOG_DATA) public data: IDadosContratoDialogData,
  ) {
    this.contrato = { ...data?.contrato };
    this.isAditivo = data?.isAditivo;
    this.loadGrupos();
    this.loadIndices();
  }

  public loadIndices(): void {
    this.serv.getIndices().subscribe((res: IIndiceCorrecaoData) => {
      this.indices = res.data;
    });
  }

  public criaFormulario(contrato: IContrato): void {
    this.formContrato = this.formContrato = this.fb.group({
      contratado: [contrato.contratado, [Validators.required, CustomValidators.validaEspacoVazio]],
      contratante: [contrato.contratante, [Validators.required, CustomValidators.validaEspacoVazio]],
      despesa: [contrato.despesaMensal, Validators.required],
      grupo: [contrato.grupo, Validators.required],
      identificador: [{ value: contrato.identificador, disabled: this.isEdicao() },
                      [Validators.required, CustomValidators.validaEspacoVazio]],
      observacao: [contrato.observacao],
      subgrupo: [contrato.subgrupo, Validators.required],
      valor: [this.formataValor(contrato.valor), { validators: Validators.required, updateOn: "blur" }],
    }) as FormGroup;

    this.formVigencia = this.fb.group({
      competenciaCorrecao: [contrato.competenciaCorrecao],
      dataInicio: [contrato.dataInicio != null ? new Date(contrato.dataInicio) : null, Validators.required],
      dataTermino: [contrato.dataTermino != null ? new Date(contrato.dataTermino) : null],
      indiceCorrecao: [contrato.indiceCorrecao],
      indiceOutro: [contrato.indiceOutro],
      indiceReajuste: [contrato.indiceReajuste, Validators.required],
      prorrogacaoAutomatica: [contrato.prorrogacaoAutomatica],
      vigencia: [contrato.vigencia],
    }) as FormGroup;
  }

  public loadGrupos(): void {
    this.serv.getGrupos().subscribe((res: IGruposData) => {
      this.grupos = res.data.grupoDespesaMensal;
    });
  }

  public formataValor(valor: number): string {
    return valor != null ? formatCurrency(valor, "pt", "", "BRL") : null;
  }

  public onValorChange(valor: string): void {
    if (valor === "" || Number(valor.replace(",", "").replace(".", "")) < 0) {
      this.utils.showDialogMessage("O valor do contrato deve ser maior ou igual a 0.");
      this.formContrato.get("valor").setValue("");
    } else {
      const valorLimitado = this.utils.currencyInputChanged(valor || "0", 15);
      this.formContrato.get("valor").patchValue(this.formataValor(valorLimitado), { onlySelf: true });
    }
  }

  public onVigenciaChange(): void {
    this.formVigencia.get("dataTermino").patchValue(null);
    this.formVigencia.get("prorrogacaoAutomatica").patchValue(null);
  }

  public onIndiceReajuste(): void {
    this.formVigencia.get("indiceCorrecao").patchValue([]);
    this.formVigencia.get("indiceOutro").patchValue(null);
    this.formVigencia.get("competenciaCorrecao").patchValue(null);
  }

  public onIndiceCorrecaoChange(): void {
    if (!this.formVigencia.get("indiceCorrecao").value.includes("Outro")) {
      this.formVigencia.get("indiceOutro").patchValue(null);
    }
  }

  public ngOnInit(): void {
    this.serventia = this.serv.getServentiaSelecionada();
    this.criaFormulario(this.contrato);
    this.formContrato.get("grupo").valueChanges.subscribe((data) => {
      if (this.grupos.find((g: IGrupo) => g === data)) {
        this.subgrupos = this.grupos.find((g: IGrupo) => g === data).subgrupo;
      } else {
        this.subgrupos = [];
      }
    });
    this.formContrato.get("subgrupo").valueChanges.subscribe((data) => {
      if (this.subgrupos.find((s: ISubgrupo) => s === data)) {
        this.despesas = this.subgrupos.find((s: ISubgrupo) => s === data).despesas;
      } else {
        this.despesas = [];
      }
    });
  }

  public getFormulario(): IContrato {
    const inicial = this.formVigencia.controls.dataInicio.value ? new Date(this.formVigencia.controls.dataInicio.value) : null;
    const final = this.formVigencia.controls.dataTermino.value ? new Date(this.formVigencia.controls.dataTermino.value) : null;
    const valor = this.utils.currencyInputChanged(this.formContrato.controls.valor.value.toString(), 15);
    return {
      competenciaCorrecao: this.formVigencia.controls.competenciaCorrecao.value,
      contratado: this.formContrato.controls.contratado.value,
      contratante: this.formContrato.controls.contratante.value,
      dataInicio: inicial ? new Date(inicial.getFullYear(), inicial.getMonth(), 1, 0, 0, 0, 0) : null,
      dataTermino: final ? new Date(final.getFullYear(), final.getMonth(), 1, 0, 0, 0, 0) : null,
      despesaMensal: this.formContrato.controls.despesa.value,
      grupo: this.formContrato.controls.grupo.value,
      identificador: this.formContrato.controls.identificador.value,
      indiceCorrecao: this.formVigencia.controls.indiceCorrecao.value,
      indiceOutro: this.formVigencia.controls.indiceOutro.value,
      indiceReajuste: this.formVigencia.controls.indiceReajuste.value,
      observacao: this.formContrato.controls.observacao.value,
      prorrogacaoAutomatica: this.formVigencia.controls.prorrogacaoAutomatica.value,
      subgrupo: this.formContrato.controls.subgrupo.value,
      valor,
      vigencia: this.formVigencia.controls.vigencia.value,
    } as IContrato;
  }

  public triggerResize(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public isEdicao(): boolean {
    return this.contrato.id != null ? true : false;
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public podeEditar(docsExcluir: IDocumentoPrestacaoContas[], docsAdicionar: IDocumentoPrestacaoContas[]): boolean {
    let can: boolean;
    can = this.formContrato.touched || this.formVigencia.touched || docsExcluir.length > 0 || docsAdicionar.length > 0;

    return can;
  }

  public salvar(): void {
    let contrato: IContrato;
    contrato = this.getFormulario();
    contrato.serventia = this.serventia;

    const dataInicio: number = this.formVigencia.value.dataInicio instanceof Date
      ? this.formVigencia.value.dataInicio.getTime()
      : this.formVigencia.value.dataInicio.toDate().getTime();

    const dataTermino: number = this.formVigencia.value.dataTermino != null && this.formVigencia.value.dataTermino instanceof Date
      ? this.formVigencia.value.dataTermino.getTime()
      : this.formVigencia.value.dataTermino != null ? this.formVigencia.value.dataTermino.toDate().getTime() : null;

    const params = {
      competenciaCorrecao: contrato.competenciaCorrecao,
      contratado: contrato.contratado,
      contratante: contrato.contratante,
      dataInicio,
      dataTermino,
      despesaMensal: contrato.despesaMensal,
      idServentia: contrato.serventia.idServentia,
      identificador: contrato.identificador,
      indiceCorrecao: contrato.indiceCorrecao,
      indiceOutro: contrato.indiceOutro,
      indiceReajuste: contrato.indiceReajuste,
      isAditivo: this.isAditivo,
      observacao: contrato.observacao,
      prorrogacaoAutomatica: contrato.prorrogacaoAutomatica,
      valor: contrato.valor,
      vigencia: contrato.vigencia,
    } as IContratoPost;

    const documentosExcluir: IDocumentoPrestacaoContas[] = this.documentos.filter(
      (d: IDocumentoPrestacaoContas) => d.idDocumento !== null && d.adicionar === false && d.file == null,
    );

    const documentosAdicionar: IDocumentoPrestacaoContas[] = this.documentos.filter(
      (d: IDocumentoPrestacaoContas) => d.idDocumento === null && d.file != null,
    );

    const documentos: IDocumentoPrestacaoContas[] = documentosExcluir.concat(documentosAdicionar);

    let call: Observable<void>;

    if (this.isEdicao()) {
      if (this.contrato.glosado !== "T" || this.podeEditar(documentosExcluir, documentosAdicionar)) {
        call = this.serv
          .editContrato(
            this.contrato.id,
            params,
            documentos,
          );
      } else {
        this.utils.showDialogMessage("Este contrato está glosado, " +
              "portanto seus dados devem ser alterados ou uma justificativa adicionada no campo " +
              "observação para que uma nova análise seja realizada.");
      }
    } else {
      call = this.serv
        .postContrato(
          params,
          documentosAdicionar,
        );
    }

    if (call != null) {
      this.ngxLoader.startLoader("loaderContrato");
      call.subscribe((success: void) => {
        this.ngxLoader.stopLoader("loaderContrato");
        this.utils.showDialogMessage("Contrato salvo com sucesso!");
        this.dialogRef.close(true);

      }, (error: HttpErrorResponse) => {
        this.ngxLoader.stopLoader("loaderContrato");
        this.utils.showDialogError(error);
      });
    }

  }

  public setDocumentos(value: IDocumentoPrestacaoContas[]): void {
    this.documentos = value;
  }

  public isVigenciaIndeterminada(): boolean {
    return this.formVigencia.get("vigencia").value == null
        || this.formVigencia.get("vigencia").value === "I";
  }

  public isNotIndiceReajuste(): boolean {
    return this.formVigencia.get("indiceReajuste").value == null
        || this.formVigencia.get("indiceReajuste").value === "N";
  }

  public isDisabledOutro(): boolean {
    return this.formVigencia.get("indiceCorrecao").value == null
        || this.formVigencia.get("indiceCorrecao").value === ""
        || !this.formVigencia.get("indiceCorrecao").value.includes("Outro");
  }

  public isVigenciaValid(): boolean {
    return (this.formVigencia.value.vigencia === "D"
      && this.formVigencia.value.dataTermino != null
      && this.formVigencia.value.prorrogacaoAutomatica != null)
      || (this.formVigencia.value.vigencia === "I"
      && this.formVigencia.value.dataTermino == null
      && this.formVigencia.value.prorrogacaoAutomatica == null);
  }

  public isReajusteValid(): boolean {
    return (this.formVigencia.value.indiceReajuste !== null
            && this.formVigencia.value.indiceReajuste === "S"
            && this.formVigencia.value.competenciaCorrecao !== null
            && this.formVigencia.value.indiceCorrecao.length > 0)
      ||
      ((this.formVigencia.value.indiceReajuste == null || this.formVigencia.value.indiceReajuste === "N")
        && this.formVigencia.value.competenciaCorrecao == null
        && this.formVigencia.value.indiceCorrecao.length === 0);
  }

  public isOutroValid(): boolean {
    return (this.formVigencia.value.indiceCorrecao.length > 0
        && this.formVigencia.value.indiceCorrecao.includes("Outro")
        && this.formVigencia.value.indiceOutro !== null
        && this.formVigencia.value.indiceOutro !== ""
    ) ||
      (
        this.formVigencia.value.indiceCorrecao.length > 0
        && !this.formVigencia.value.indiceCorrecao.includes("Outro")
        && (this.formVigencia.value.indiceOutro == null || this.formVigencia.value.indiceOutro === "")
      ) ||
      (
        (this.formVigencia.value.indiceReajuste === null || this.formVigencia.value.indiceReajuste === "N")
          && this.formVigencia.value.indiceCorrecao.length === 0
          && (this.formVigencia.value.indiceOutro == null || this.formVigencia.value.indiceOutro === "")
      );
  }

  public isCompleteVigencia(): boolean {

    const isComplete: boolean = this.isVigenciaValid() && this.isReajusteValid() && this.isOutroValid() && !this.formVigencia.invalid;

    return isComplete;

  }

  public isCompleteDocs(): boolean {
    if (!this.isAditivo) {
      return ( // adicionar

        (this.documentos.filter((d) => !d.idDocumento
                                && d.tipo.descricao.toUpperCase() !== "Aditivo".toUpperCase()
                                && d.adicionar === true).length === 1)
        // substituir
        || (this.documentos.filter((d) => d.idDocumento
                                && d.tipo.descricao.toUpperCase() !== "Aditivo".toUpperCase()
                                && d.adicionar === false || !d.idDocumento
                                && d.adicionar === true).length === 2)
        // sem modificar
        || (this.documentos.filter((d) => d.idDocumento
                                && d.tipo.descricao.toUpperCase() !== "Aditivo".toUpperCase()
                                && (d.adicionar === null || d.adicionar === undefined)).length === 1)
      );
    } else {
      return this.documentos.filter((d) => !d.idDocumento
                                && d.adicionar === true
                                && d.tipo.descricao.toUpperCase() === "Aditivo".toUpperCase()).length === 1;
    }
  }

}
