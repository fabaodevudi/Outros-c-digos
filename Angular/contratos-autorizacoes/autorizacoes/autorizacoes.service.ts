import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IAutorizacaoPost } from "src/app/shared/model/autorizacao";
import { IApiData } from "src/app/shared/model/data";
import { IDocumentoPrestacaoContas } from "src/app/shared/model/documentos-prestacao-contas";
import { IGruposData } from "src/app/shared/model/grupo-despesa-mensal";
import { IMotivoGlosaData } from "src/app/shared/model/motivo-glosa";
import { IServentia, IServentiasData } from "src/app/shared/model/serventia";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AutorizacoesService {

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

  public postAutorizacao(autorizacao: IAutorizacaoPost, documentos: IDocumentoPrestacaoContas[]): Observable<void> {
    const formData: FormData = new FormData();
    formData.append("autorizacao", JSON.stringify(autorizacao));
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

    return this.http.post<void>(this.baseUrl + "/autorizacoes", formData, { reportProgress: true });
  }

  public editAutorizacao(id: number, autorizacao: IAutorizacaoPost, documentos: IDocumentoPrestacaoContas[]): Observable<void> {
    const formData: FormData = new FormData();
    formData.append("autorizacao", JSON.stringify(autorizacao));
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
    return this.http.put<void>(this.baseUrl + `/autorizacoes/${id}`, formData, { reportProgress: true });
  }

  public getMotivosGlosa(idAutorizacao: number): Observable<IMotivoGlosaData> {
    return this.http.get<IMotivoGlosaData>(this.baseUrl + `/autorizacoes/${idAutorizacao}/motivos`);
  }

  public get(filtro: any): Observable<IGruposData> {
    return this.http.put<IGruposData>(this.baseUrl + "/autorizacoes", filtro);
  }

  public getAutorizacao(id: number): Observable<IApiData> {
    return this.http.get<IApiData>(this.baseUrl + "/autorizacoes/" + id);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + "/autorizacoes/" + id);
  }
}
