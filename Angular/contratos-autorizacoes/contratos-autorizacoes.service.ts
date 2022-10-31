import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IContratoData, IContratoPost } from "../shared/model/contratos";
import { IApiData } from "../shared/model/data";
import { IDocumentoPrestacaoContas } from "../shared/model/documentos-prestacao-contas";
import { IGruposData } from "../shared/model/grupo-despesa-mensal";
import { IIndiceCorrecaoData } from "../shared/model/indice-correcao";
import { IMotivoGlosaData } from "../shared/model/motivo-glosa";
import { IServentia, IServentiasData } from "../shared/model/serventia";

@Injectable({
  providedIn: "root",
})
export class ContratosAutorizacoesService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getListaServentias(): Observable<IServentiasData> {
    return this.http.get<IServentiasData>(this.baseUrl + `/serventias?interino=S`);
  }

  public isServentiaSelecionada(): boolean {
    if (sessionStorage.getItem("serventia") != null && sessionStorage.getItem("serventia") !== "undefined") {
      return true;
    }
    return false;
  }

  public getServentiaSelecionada(): IServentia {
    return JSON.parse(sessionStorage.getItem("serventia"));
  }

  public setServentiaSelecionada(serventia: IServentia): void {
    sessionStorage.setItem("serventia", JSON.stringify(serventia));
  }

  public getGrupos(): Observable<IGruposData> {
    return this.http.get<IGruposData>(this.baseUrl + "/despesas/agrupamentos");
  }

  public getIndices(): Observable<IIndiceCorrecaoData> {
    return this.http.get<IIndiceCorrecaoData>(this.baseUrl + "/contratos/indices");
  }

  public postContrato(contrato: IContratoPost, documentos: IDocumentoPrestacaoContas[]): Observable<void> {
    const formData: FormData = new FormData();
    formData.append("contrato", JSON.stringify(contrato));
    documentos.forEach(
      (documento) => {
        formData.append("tipos", documento.tipo.idTipoDocumento.toString());
        if (documento.file !== undefined) {
          formData.append("dados",
                new File([documento.file.slice()], encodeURIComponent(documento.file.name), { type: documento.file.type }));
        } else {
          formData.append("dados", new File([""], encodeURIComponent(documento.nomeArquivo), { type: "application/pdf" }));
        }
      },
    );

    return this.http.post<void>(this.baseUrl + "/contratos", formData, { reportProgress: true });
  }

  public editContrato(id: number, contrato: IContratoPost, documentos: IDocumentoPrestacaoContas[]): Observable<void> {
    const formData: FormData = new FormData();
    formData.append("contrato", JSON.stringify(contrato));
    documentos.forEach(
      (documento) => {
        formData.append("acoes", documento.adicionar ?  "1" : "2");
        formData.append("ids", documento.adicionar ? documento.tipo.idTipoDocumento.toString() : documento.idDocumento.toString());
        if (documento.file !== undefined) {
          formData.append("dados",
                new File([documento.file.slice()], encodeURIComponent(documento.file.name), { type: documento.file.type }));
        } else {
          formData.append("dados", new File([""], encodeURIComponent(documento.nomeArquivo), { type: "application/pdf" }));
        }
      },
    );
    return this.http.put<void>(this.baseUrl + `/contratos/${id}`, formData, { reportProgress: true });
  }

  public getMotivosGlosa(idContrato: number): Observable<IMotivoGlosaData> {
    return this.http.get<IMotivoGlosaData>(this.baseUrl + `/contratos/${idContrato}/motivos`);
  }

  public getAgrupamento(filtro: any): Observable<IGruposData> {

    return this.http.put<IGruposData>(this.baseUrl + "/contratos", filtro);
  }

  public getContrato(id: number): Observable<IContratoData> {
    return this.http.get<IApiData>(this.baseUrl + "/contratos/" + id);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + "/contratos/" + id);
  }
}
