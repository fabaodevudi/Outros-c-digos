import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { debounceTime } from "rxjs/operators";
import { IAutorizacao, IAutorizacaoData, IFiltroAutorizacao } from "src/app/shared/model/autorizacao";
import { IDespesaMensal } from "src/app/shared/model/despesas-prestacao-contas";
import { IGrupo, IGruposData, ISubgrupo } from "src/app/shared/model/grupo-despesa-mensal";
import { IServentia } from "src/app/shared/model/serventia";
import { UtilsService } from "src/app/shared/utils.service";
import { AutorizacaoDialogComponent } from "./autorizacao-dialog/autorizacao-dialog.component";
import { AutorizacaoVisualizacaoComponent } from "./autorizacao-visualizacao/autorizacao-visualizacao.component";
import { AutorizacoesService } from "./autorizacoes.service";
@Component({
  selector: "app-autorizacoes",
  styleUrls: ["./autorizacoes.component.css"],
  templateUrl: "./autorizacoes.component.html",
})
export class AutorizacoesComponent implements OnInit, OnChanges {
  constructor(
    private dialog: MatDialog,
    private serv: AutorizacoesService,
    private ngxLoader: NgxUiLoaderService,
    private utils: UtilsService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      dataInicio: [null],
      dataTermino: [null],
      identificador: [""],
      vigencia: [""],
    });
    this.form.valueChanges.pipe(debounceTime(1000)).subscribe((val: IFiltroAutorizacao) => {
      this.load(val);
    });
  }

  @Input() public serventia: IServentia;
  public grupos: IGrupo[] = [];

  public dataInicio: FormControl = new FormControl();
  public dataTermino: FormControl = new FormControl();

  public form: FormGroup;
  public dataSource: MatTableDataSource<IGrupo>;

  private load(filtro: IFiltroAutorizacao): void {
      const params = {
      dataInicio: filtro.dataInicio ? new Date(filtro.dataInicio).getTime() : null,
      dataTermino: filtro.dataTermino ? new Date(filtro.dataTermino).getTime() : null,
      idServentia: this.serventia.idServentia,
      identificador: filtro.identificador,
      vigencia: filtro.vigencia,
    };
      this.ngxLoader.startLoader("loaderAutorizacoes");
      this.serv.get(params).subscribe(
      (res: IGruposData) => {
        this.ngxLoader.stopLoader("loaderAutorizacoes");
        this.setGrupos(res.data.grupoDespesaMensal);
      }, (error: HttpErrorResponse) => {
        this.ngxLoader.stopLoader("loaderAutorizacoes");
        this.utils.showDialogError(error);
      });
  }

  public deletar(autorizacao: IAutorizacao): void {
    this.utils
      .showDialogConfirmation({
        content: `Desejas confirmar a exclusão da autorização <b>${autorizacao.identificador}</b>?`,
        title: "Confirmação",
      })
      .subscribe((result) => {
        if (result) {
          this.ngxLoader.startLoader("loaderAutorizacoes");
          this.serv.delete(autorizacao.id).subscribe((response) => {
            this.ngxLoader.stopLoader("loaderAutorizacoes");
            this.utils.showDialogMessage("Autorização excluído com sucesso!");
            this.load(this.getFiltro());
          }, (error: HttpErrorResponse) => {
            this.ngxLoader.stopLoader("loaderAutorizacoes");
            this.utils.showDialogError(error);
          });
        }
      });
  }

  public getFiltro(): IFiltroAutorizacao {
    const inicial = this.form.controls.dataInicio.value ? new Date(this.form.controls.dataInicio.value) : null;
    const final = this.form.controls.dataTermino.value ? new Date(this.form.controls.dataTermino.value) : null;
    return {
      dataInicio: inicial ? new Date(inicial.getFullYear(), inicial.getMonth(), 1, 0, 0, 0, 0) : null,
      dataTermino: final ? new Date(final.getFullYear(), final.getMonth(), 1, 0, 0, 0, 0) : null,
      idServentia: this.serventia.idServentia,
      identificador: this.form.controls.identificador.value,
      vigencia: this.form.controls.vigencia.value,
    } as IFiltroAutorizacao;
  }

  public getGrupos(): IGrupo[] {
    return this.grupos;
  }

  public setGrupos(value: IGrupo[]): void {
    this.grupos = value;
  }

  public adicionar(): void {
    const dialogEditar = this.dialog.open(AutorizacaoDialogComponent, {
      data: {
        autorizacao: this.criarObjetoEmBranco(),
      },
      maxHeight: "700",
      minHeight: "700",
      minWidth: "50%",
    });

    dialogEditar.afterClosed().subscribe((result) => {
      if (result) {
        this.load(this.getFiltro());
      }
    });
  }

  public editar(autorizacao: IAutorizacao, grupo: IGrupo, subgrupo: ISubgrupo, despesaMensal: IDespesaMensal): void {
    this.ngxLoader.startLoader("loaderAutorizacoes");
    this.serv.getAutorizacao(autorizacao.id).subscribe((res: IAutorizacaoData) => {
      this.ngxLoader.stopLoader("loaderAutorizacoes");
      autorizacao = { ...res.data };
      autorizacao.grupo = { ...grupo };
      autorizacao.subgrupo = { ...subgrupo };
      autorizacao.despesaMensal = { ...despesaMensal };
      const dialogEditar = this.dialog.open(AutorizacaoDialogComponent, {
        data: {
          autorizacao,
        },
        maxHeight: "750",
        minHeight: "750",
        minWidth: "50%",
      });
      dialogEditar.afterClosed().subscribe((result) => {
        if (result) {
          this.load(this.getFiltro());
        }
      });
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderAutorizacoes");
      this.utils.showDialogError(error);
    });
  }

  public visualizar(autorizacao: IAutorizacao, grupo: IGrupo, subgrupo: ISubgrupo, despesaMensal: IDespesaMensal): void {
    this.ngxLoader.startLoader("loaderAutorizacoes");
    this.serv.getAutorizacao(autorizacao.id).subscribe((res: IAutorizacaoData) => {
      this.ngxLoader.stopLoader("loaderAutorizacoes");
      autorizacao = { ...res.data };
      autorizacao.grupo = { ...grupo };
      autorizacao.subgrupo = { ...subgrupo };
      autorizacao.despesaMensal = { ...despesaMensal };

      const dialogEditar = this.dialog.open(AutorizacaoVisualizacaoComponent, {
        data: {
          autorizacao,
        },
        maxWidth: "600px",
        minWidth: "600px",
      });
      dialogEditar.afterClosed().subscribe((result) => {

      });
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderAutorizacoes");
      this.utils.showDialogError(error);

    });
  }

  public criarObjetoEmBranco(): IAutorizacao {
    return {
      dataInicio: null,
      despesa: null,
      grupo: null,
      id: null,
      identificador: null,
      observacao: null,
      subgrupo: null,
    } as IAutorizacao;
  }

  public ngOnInit(): void {
    this.serventia = this.serv.getServentiaSelecionada();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.serventia.currentValue) {
      this.serventia = changes.serventia.currentValue;
    }
    this.load(this.getFiltro());
  }

}
