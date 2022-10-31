import { SimpleChanges } from "@angular/core";
import { OnChanges } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { IServentia, IServentiasData } from "../shared/model/serventia";
import { UtilsService } from "../shared/utils.service";
import { ContratosAutorizacoesService } from "./contratos-autorizacoes.service";

@Component({
  selector: "app-contratos-autorizacoes",
  styleUrls: ["./contratos-autorizacoes.component.css"],
  templateUrl: "./contratos-autorizacoes.component.html",
})
export class ContratosAutorizacoesComponent implements OnInit {

  constructor(
    private ngxLoader: NgxUiLoaderService,
    private service: ContratosAutorizacoesService,
    private router: Router,
    private utils: UtilsService,
  ) {}

  public listaServentia: IServentia[];
  public serventia: IServentia;

  public ngOnInit(): void {
    this.serventia = this.getServentiaSelecionada();
    this.getServentias();
  }

  public compare(s1: any, s2: any): boolean {
    return s1.idServentia === s2.idServentia && s1.idUsuario === s2.idUsuario  && s1.titularidade === s2.titularidade;
  }

  public getServentiaSelecionada(): IServentia {
    if (this.service.isServentiaSelecionada) {
      return this.service.getServentiaSelecionada();
    } else {
      return null;
    }
  }

  public getServentias(): void {
    this.ngxLoader.startLoader("loaderServentias");
    this.service.getListaServentias().subscribe((res: IServentiasData) => {
      this.ngxLoader.stopLoader("loaderServentias");
      this.listaServentia = res.data;
    }, (error) => {
      this.ngxLoader.stopLoader("loaderServentias");
      this.utils.showDialogError(error);
    });
  }

  public geraDescricao(serventia: IServentia): string {
    const descricao: string =
      serventia.idServentia.toString().padStart(4, "0") +
      " " +
      serventia.componente3 +
      " :: " +
      serventia.componente1 +
      " - " +
      serventia.titularidade;

    return descricao;
  }

  public updateServentia(): void {
    this.service.setServentiaSelecionada(this.serventia);
  }

}
