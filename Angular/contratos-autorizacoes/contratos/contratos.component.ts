import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { debounceTime } from "rxjs/operators";
import { IContrato, IContratoData, IFiltroContrato } from "src/app/shared/model/contratos";
import { IDespesaMensal } from "src/app/shared/model/despesas-prestacao-contas";
import { IGrupo, IGruposData, ISubgrupo } from "src/app/shared/model/grupo-despesa-mensal";
import { IServentia } from "src/app/shared/model/serventia";
import { UtilsService } from "src/app/shared/utils.service";
import { ContratosAutorizacoesService } from "../contratos-autorizacoes.service";
import { ContratoDialogComponent } from "./contrato-dialog/contrato-dialog.component";
import { ContratoVisualizacaoComponent } from "./contrato-visualizacao/contrato-visualizacao.component";

@Component({
  selector: "app-contratos",
  styleUrls: ["./contratos.component.css"],
  templateUrl: "./contratos.component.html",
})
export class ContratosComponent implements OnInit, OnChanges {

  constructor(
    private dialog: MatDialog,
    private serv: ContratosAutorizacoesService,
    private ngxLoader: NgxUiLoaderService,
    private utils: UtilsService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      contratado: [""],
      contratante: [""],
      dataInicio: [null],
      dataTermino: [null],
      identificador: [""],
    });

    this.form.valueChanges.pipe(debounceTime(1000)).subscribe((val: IFiltroContrato) => {
    this.load(val);
  });

  }
  @Input() public serventia: IServentia;
  public grupos: IGrupo[] = [];

  public dataInicio: FormControl = new FormControl();
  public dataSource: MatTableDataSource<IGrupo>;
  public dataTermino: FormControl = new FormControl();
  public form: FormGroup;
  public novaDataInicial: Date;
  public novaDataFinal: Date;

  public load(filtro: IFiltroContrato): void {
    const params = {
      contratado: filtro.contratado,
      contratante: filtro.contratante,
      dataInicio: filtro.dataInicio ? new Date(filtro.dataInicio).getTime() : null,
      dataTermino: filtro.dataTermino ? new Date(filtro.dataTermino).getTime() : null,
      idServentia: this.serventia.idServentia,
      identificador: filtro.identificador,
    };
    this.ngxLoader.startLoader("loaderContratos");
    this.serv.getAgrupamento(params).subscribe((res: IGruposData) => {
        this.ngxLoader.stopLoader("loaderContratos");
        this.setGrupos(res.data.grupoDespesaMensal);
      }, (error: HttpErrorResponse) => {
        this.ngxLoader.stopLoader("loaderContratos");
        this.utils.showDialogError(error);
      });
  }

  public deletar(contrato: IContrato): void {
    this.utils
      .showDialogConfirmation({
        content: `Desejas confirmar a exclusão do contrato <b>${contrato.identificador}</b>?`,
        title: "Confirmação",
      })
      .subscribe((result) => {
        if (result) {
          this.ngxLoader.startLoader("loaderContratos");
          this.serv.delete(contrato.id).subscribe((response) => {
            this.ngxLoader.stopLoader("loaderContratos");
            this.utils.showDialogMessage("Contrato excluído com sucesso!");
            this.load(this.getFiltro());
          }, (error: HttpErrorResponse) => {
            this.ngxLoader.stopLoader("loaderContratos");
            this.utils.showDialogError(error);
          } );
        }
      });
  }

  public getFiltro(): IFiltroContrato {
    const inicial = this.form.controls.dataInicio.value ? new Date(this.form.controls.dataInicio.value) : null;
    const final = this.form.controls.dataTermino.value ? new Date(this.form.controls.dataTermino.value) : null;
    return {
      contratado: this.form.controls.contratado.value,
      contratante: this.form.controls.contratante.value,
      dataInicio : inicial ? new Date(inicial.getFullYear(), inicial.getMonth(), 1, 0, 0, 0, 0) : null,
      dataTermino: final ? new Date(final.getFullYear(), final.getMonth(), 1, 0, 0, 0, 0) : null,
      idServentia: this.serventia.idServentia,
      identificador: this.form.controls.identificador.value,
    } as IFiltroContrato;
  }

  public getGrupos(): IGrupo[] {
    return this.grupos;
  }

  public setGrupos(value: IGrupo[]): void {
    this.grupos = value;
  }

  public adicionar(): void {
    const dialogEditar = this.dialog.open(ContratoDialogComponent, {
      data: {
        contrato: this.criarObjetoEmBranco(),
        isAditivo : false,
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
  }

  public editar(contrato: IContrato, grupo: IGrupo, subgrupo: ISubgrupo, despesaMensal: IDespesaMensal): void {
    this.ngxLoader.startLoader("loaderContratos");
    this.serv.getContrato(contrato.id).subscribe((res: IContratoData)  => {
      this.ngxLoader.stopLoader("loaderContratos");
      contrato = {...res.data};
      contrato.grupo = {...grupo};
      contrato.subgrupo = {...subgrupo};
      contrato.despesaMensal = {...despesaMensal};
      const dialogEditar = this.dialog.open(ContratoDialogComponent, {
        data: {
          contrato,
          isAditivo : false,
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
      this.ngxLoader.stopLoader("loaderContratos");
      this.utils.showDialogError(error);
    });
  }

  public visualizar(contrato: IContrato, grupo: IGrupo, subgrupo: ISubgrupo, despesaMensal: IDespesaMensal): void {
    this.ngxLoader.startLoader("loaderContratos");
    this.serv.getContrato(contrato.id).subscribe((res: IContratoData)  => {
      this.ngxLoader.stopLoader("loaderContratos");
      contrato = {...res.data};
      contrato.grupo = {...grupo};
      contrato.subgrupo = {...subgrupo};
      contrato.despesaMensal = {...despesaMensal};
      const dialogEditar = this.dialog.open(ContratoVisualizacaoComponent, {
          data: {
            contrato,
          },
          maxHeight: "750",
          maxWidth: "80%",
          minHeight: "750",
          minWidth: "80%",
        });
      dialogEditar.afterClosed().subscribe((result) => {

      });
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderContratos");
      this.utils.showDialogError(error);
    });
  }

  public aditivar(contrato: IContrato, grupo: IGrupo, subgrupo: ISubgrupo, despesaMensal: IDespesaMensal): void {
    this.ngxLoader.startLoader("loaderContratos");
    this.serv.getContrato(contrato.id).subscribe((res: IContratoData)  => {
      this.ngxLoader.stopLoader("loaderContratos");
      contrato = {...res.data};
      contrato.grupo = {...grupo};
      contrato.subgrupo = {...subgrupo};
      contrato.despesaMensal = {...despesaMensal};
      const dialogEditar = this.dialog.open(ContratoDialogComponent, {
          data: {
            contrato,
            isAditivo : true,
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
      this.ngxLoader.stopLoader("loaderContratos");
      this.utils.showDialogError(error);
    });
  }

  public criarObjetoEmBranco(): IContrato {
    return {
      competenciaCorrecao: null,
      contratado: null,
      contratante: null,
      dataInicio: null,
      dataTermino: null,
      despesa: null,
      grupo: null,
      id: null,
      identificador: null,
      indiceCorrecao: [],
      indiceOutro: null,
      indiceReajuste: null,
      observacao: null,
      prorrogacaoAutomatica: null,
      subgrupo: null,
      valor: null,
      vigencia: null,
    } as IContrato;
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
