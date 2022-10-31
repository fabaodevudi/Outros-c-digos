import { HttpClient } from "@angular/common/http";
import { Injectable, SystemJsNgModuleLoader } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IApiData } from "../shared/model/data";
import { IPerfil } from "../shared/model/perfil";
import { IServentiaGerencialData, IServentiaPermissoes, IServentiaPermissoesData } from "../shared/model/serventia";
import { IFiltroUsuario, IUsuarioData, IUsuarioPerfisData } from "../shared/model/usuario";

@Injectable({
  providedIn: "root",
})
export class GestaoUsuariosService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public countServentiasPerfil(id: number, perfil: number): Observable<IApiData> {
    return this.http.get<IApiData>(this.baseUrl + `/usuarios/${id}/perfil/${perfil}/contagem/serventias`);
  }

  public getListaServentiasByLoginAndPerfil(id: number, perfil: number): Observable<IServentiaPermissoesData> {
    return this.http.get<IServentiaPermissoesData>(this.baseUrl + `/serventias/permissao/usuario/${id}/perfil/${perfil}`);
  }

  public putPerfisUsuario(idUsuario: number, perfis: IPerfil[]): Observable<IApiData> {
    const params = {
      perfis,
    };
    return this.http.put<IApiData>(this.baseUrl + `/usuarios/${idUsuario}/perfis`, params);
  }

  public postUsuario(login: string): Observable<IApiData> {
    const params = {
      login,
    };
    return this.http.post<IApiData>(this.baseUrl + `/usuarios`, params);
  }

  public putServentiasUsuario(idUsuario: number, idPerfil: number, serventias: IServentiaPermissoes[]): Observable<IApiData> {
    const params = {
      listaServentias: serventias,
    };
    return this.http.put<IApiData>(this.baseUrl + `/usuarios/${idUsuario}/perfil/${idPerfil}/serventias`, params);
  }

  public getUsuarios(): Observable<IUsuarioData> {
    return this.http.get<IUsuarioData>(this.baseUrl + "/usuarios");
  }

  public getListaPerfilByUsuario(idUsuario: number): Observable<IUsuarioPerfisData> {
    return this.http.get<IUsuarioPerfisData>(this.baseUrl + `/usuarios/${idUsuario}/perfis`);
  }

  public getFiltroUsuario(): IFiltroUsuario {
    return JSON.parse(sessionStorage.getItem("filtroUsuario"));
  }

  public setFiltroUsuario(filtro: IFiltroUsuario): void {
    sessionStorage.setItem("filtroUsuario", JSON.stringify(filtro));
  }

  public setIsServentiaAtualizado(isServentiaAtualizado: boolean): void {
    sessionStorage.setItem("isServentiaAtualizado", JSON.stringify(isServentiaAtualizado));
  }

  public getIsServentiaAtualizado(): boolean {
    return JSON.parse(sessionStorage.getItem("isServentiaAtualizado"));
  }

  public setIsGestaoUsuariosAtualizado(isGestaoUsuariosAtualizado: boolean): void {
    sessionStorage.setItem("isGestaoUsuariosAtualizado", JSON.stringify(isGestaoUsuariosAtualizado));
  }

  public getIsGestaoUsuariosAtualizado(): boolean {
    return JSON.parse(sessionStorage.getItem("isGestaoUsuariosAtualizado"));
  }

  public getServentias(): Observable<IServentiaGerencialData> {
    return this.http.get<IServentiaGerencialData>(this.baseUrl + "/relatorios/prestacaoContas/serventia");
  }

}
