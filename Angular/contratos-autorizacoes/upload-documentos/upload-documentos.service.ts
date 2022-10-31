import { HttpClient, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { IDocumentoPrestacaoContas, IDocumentoPrestacaoContasData } from "src/app/shared/model/documentos-prestacao-contas";
import { ITiposDocumentoData } from "src/app/shared/model/tipo-documento";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UploadDocumentosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getTiposDocumentoContrato(): Observable<ITiposDocumentoData> {
    return this.http.get<ITiposDocumentoData>(this.baseUrl + `/documentos/contrato/tipos`);
  }

  public getTiposDocumentoAutorizacao(): Observable<ITiposDocumentoData> {
    return this.http.get<ITiposDocumentoData>(this.baseUrl + `/documentos/autorizacao/tipos`);
  }

  public getDocumentosContrato(idContrato: number): Observable<IDocumentoPrestacaoContasData> {
    return this.http.get<IDocumentoPrestacaoContasData>(this.baseUrl +  `/documentos/contrato/${idContrato}/salvos`);
  }

  public getDocumentosAutorizacao(idAutorizacao: number): Observable<IDocumentoPrestacaoContasData> {
    return this.http.get<IDocumentoPrestacaoContasData>(this.baseUrl +  `/documentos/autorizacao/${idAutorizacao}/salvos`);
  }

  public getDocumento(doc: IDocumentoPrestacaoContas): Observable<HttpResponse<Blob>> {
    if (doc.tipo.tipo === "C") {
      return this.http.get(this.baseUrl + `/documentos/contrato/${doc.idDocumento}`, { observe: "response", responseType: "blob" });
    } else if (doc.tipo.tipo === "A") {
      return this.http.get(this.baseUrl + `/documentos/autorizacao/${doc.idDocumento}`, { observe: "response", responseType: "blob" });
    }
  }

}
