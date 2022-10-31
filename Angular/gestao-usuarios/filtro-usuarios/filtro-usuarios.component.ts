import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { PerfilService } from "src/app/perfil/perfil.service";
import { IPerfil } from "src/app/shared/model/perfil";
import { IServentiaGerencial } from "src/app/shared/model/serventia";
import { IFiltroUsuario, IUsuario} from "src/app/shared/model/usuario";
import { UtilsService } from "src/app/shared/utils.service";
import { GestaoPerfisModalComponent } from "../gestao-perfis-modal/gestao-perfis-modal.component";
import { GestaoUsuariosService } from "../gestao-usuarios.service";

@Component({
  selector: "app-filtro-usuarios",
  styleUrls: ["./filtro-usuarios.component.css"],
  templateUrl: "./filtro-usuarios.component.html",
})
export class FiltroUsuariosComponent implements OnInit {

  public form: FormGroup;

  public displayedColumns: string[] = ["name", "login", "editar"];
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild(MatPaginator) public paginator: MatPaginator;

  public listaData: MatTableDataSource<IUsuario>;
  public listaPerfil: IPerfil[] = [];
  public listaServentias: IServentiaGerencial[] = [];
  public filtroServentiasV: Observable<IServentiaGerencial[]>;
  public filtroServentiasE: Observable<IServentiaGerencial[]>;
  public serventiaV: FormControl = new FormControl();
  public serventiaE: FormControl = new FormControl();

  constructor(private perfilService: PerfilService,
              private ngxLoader: NgxUiLoaderService,
              private gestaoUsuarioService: GestaoUsuariosService,
              private fb: FormBuilder,
              private utils: UtilsService,
              private dialog: MatDialog,
  ) {}

  public ngOnInit(): void {
    this.filtroServentiasV = this.serventiaV.valueChanges
    .pipe(
      startWith(""),
      map((value) => this.filtrarServentia(value, 0)),
    );

    this.filtroServentiasE = this.serventiaE.valueChanges
    .pipe(
      startWith(""),
      map((value) => this.filtrarServentia(value, 1)),
    );
    this.criarFormulario(this.criarObjetoEmBranco());
    this.iniciaDados();
  }

  public isRegistros(): boolean {
    return this.paginator != null &&  this.paginator.length > 0;
  }

  private criarFormulario(filtroUsuario: IFiltroUsuario): void {
    this.form = this.fb.group({
      login: [filtroUsuario.login],
      name: [filtroUsuario.name],
      perfil: [filtroUsuario.perfil],
      serventiaE: [filtroUsuario.serventiaE],
      serventiaV: [filtroUsuario.serventiaV],
    });
  }

  private criarObjetoEmBranco(): IFiltroUsuario {
    return {
      login: "",
      name: "",
      perfil: [],
      serventiaE: "",
      serventiaV: "",
    } as IFiltroUsuario;
  }

  private iniciaFiltro(): void {
    this.form.valueChanges.subscribe((val: IFiltroUsuario) => {
      sessionStorage.removeItem("filtroUsuario");
      this.listaData.filter = JSON.stringify(this.form.value);
    });
  }

  public customFilterPredicate(): (data: IUsuario, filter: string) => boolean {
    const myFilterPredicate = (data: IUsuario, filter: string) => {

      const searchString = JSON.parse(filter);

      const nome = searchString.name === ""
        ? true
        : data.name
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.name.toLowerCase()) !== -1;

      if (!nome) {
        return nome;
      }

      const login = searchString.login === ""
        ? true
        : data.login
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.login.toLowerCase()) !== -1;

      if (!login) {
        return login;
      }

      const serventiaV = searchString.serventiaV === ""
        ? true
        : data.serventias.length > 0
        ? data.serventias.some((r) => (r.permissaoI === "L" || r.permissaoT === "L")
                          &&  r.razaoSocial.toLowerCase() === searchString.serventiaV.toLowerCase())  : false;

      if (!serventiaV) {
        return serventiaV;
      }

      const serventiaE = searchString.serventiaE === ""
        ? true
        : data.serventias.length > 0
        ? data.serventias.some((r) => (r.permissaoI === "E" || r.permissaoT === "E")
                          &&  r.razaoSocial.toLowerCase() === searchString.serventiaE.toLowerCase())  : false;

      if (!serventiaE) {
        return serventiaE;
      }

      let perfil = true;
      if (searchString.perfil.length === 0) {
        perfil = true;
      } else if (searchString.perfil.length === 1) {
        perfil = data.perfis.includes(searchString.perfil.toString());
      } else {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < searchString.perfil.length; i++) {
          const item = searchString.perfil[i];
          let perfilBuscado: string;
          perfilBuscado = data.perfis.find((itemBusca) => itemBusca === item);
          if (perfilBuscado == null) {
            perfil = false;
            break;
          }
        }
      }

      return login && nome && serventiaV && serventiaE && perfil;

    };
    return myFilterPredicate;
  }

  private isUsuarioEmpty(filtro: IFiltroUsuario): boolean {
    return filtro.name === "" && filtro.login === "" && filtro.serventiaE === "" && filtro.serventiaV === "" && filtro.perfil.length === 0;
  }

  private getUsuarios(): void {
    this.ngxLoader.startLoader("loaderPerfis");
    this.gestaoUsuarioService.getUsuarios().subscribe((res) => {
      this.listaData = new MatTableDataSource(res.data);
      this.listaData.paginator = this.paginator;
      this.listaData.sort = this.sort;
      this.listaData.filterPredicate = this.customFilterPredicate();
      this.ngxLoader.stopLoader("loaderPerfis");
    }, (error) => {
      this.utils.showDialogError(error);
      this.ngxLoader.stopLoader("loaderPerfis");
    });
  }

  private getUsuariosAfterEdit(): void {
    const filtro: IFiltroUsuario = this.gestaoUsuarioService.getFiltroUsuario();

    if (filtro != null) {
      this.criarFormulario(filtro);
    }

    sessionStorage.removeItem("filtroUsuario");
    this.ngxLoader.startLoader("loaderPerfis");
    this.gestaoUsuarioService.getUsuarios().subscribe((res) => {
      this.listaData = new MatTableDataSource(res.data);
      this.listaData.paginator = this.paginator;
      this.listaData.sort = this.sort;
      this.listaData.filterPredicate = this.customFilterPredicate();
      this.listaData.filter = JSON.stringify(this.form.value);
      this.iniciaFiltro();
      this.ngxLoader.stopLoader("loaderPerfis");
    }, (error) => {
      this.ngxLoader.stopLoader("loaderPerfis");
      this.utils.showDialogError(error);
    });
  }

  private getPerfis(): void {
    this.perfilService.getPerfis().subscribe((res) => {
      this.listaPerfil = res.data;
      const semPerfil: IPerfil = {};
      semPerfil.nome = "Sem Perfil";
      semPerfil.idPerfilPortalExtrajud = -1;
      this.listaPerfil.push(semPerfil);
    }, (error) => {
      this.utils.showDialogError(error);
    });
  }

  private iniciaDados(): void {
    this.getPerfis();
    this.getUsuarios();
    this.getserventias();
    this.iniciaFiltro();
  }

  public getFiltro(): IFiltroUsuario {
    return {
      login: this.form.get("login").value,
      name: this.form.get("name").value,
      perfil: this.form.get("perfil").value,
      serventiaE: this.form.get("serventiaE").value,
      serventiaV: this.form.get("serventiaV").value,
    } as IFiltroUsuario;
  }

  public editaPerfil(usuario: IUsuario): void {
    const user: IUsuario = {...usuario};
    user.serventias = [];
    const perfis: IPerfil[] = this.listaPerfil.filter((item) => item.nome !== "Sem Perfil");

    if (!this.isUsuarioEmpty(this.getFiltro())) {
      this.gestaoUsuarioService.setFiltroUsuario(this.getFiltro());
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      perfis,
      usuario: user,
    };

    dialogConfig.minWidth = "600px";

    const dialogEditar = this.dialog.open(GestaoPerfisModalComponent, dialogConfig);

    dialogEditar.afterClosed().subscribe((result) => {
      const isGestaoUsuariosAtualizado: boolean = this.gestaoUsuarioService.getIsGestaoUsuariosAtualizado != null
                          && this.gestaoUsuarioService.getIsGestaoUsuariosAtualizado() ? true : false;
      if (isGestaoUsuariosAtualizado) {
        this.getUsuariosAfterEdit();
      }
      sessionStorage.removeItem("isGestaoUsuariosAtualizado");
    });
  }

  public getserventias(): void {
    this.gestaoUsuarioService.getServentias().subscribe((response) => {
      this.listaServentias = response.data;
    }, (error) => {
      this.utils.showDialogError(error);
    });
  }

  public filtrarServentia(value: any, componente: number): IServentiaGerencial[] {
    if (value === null || value === undefined) {
      return;
    }

    switch (componente) {
      case 0:
        if (value.idServentia) {
          this.form.controls.serventiaV.setValue(value.idServentia.toString());
          return [ value ];
        } else if (value === "" && this.form.controls.serventiaV.value) {
          this.form.controls.serventiaV.setValue("");
          return this.listaServentias;
        }
        break;
      case 1:
        if (value.idServentia) {
          this.form.controls.serventiaE.setValue(value.idServentia.toString());
          return [ value ];
        } else if (value === "" && this.form.controls.serventiaE.value) {
          this.form.controls.serventiaE.setValue("");
          return this.listaServentias;
        }
        break;
    }
    const filtro = value.toLowerCase();
    return this.listaServentias.filter((s) => s.serventia.toLowerCase().includes(filtro));
  }

  public formatarServentia(s: IServentiaGerencial): string {
    return s ? s.serventia : "";
  }
}
