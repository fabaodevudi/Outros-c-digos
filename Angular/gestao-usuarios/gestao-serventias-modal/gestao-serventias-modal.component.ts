import { SelectionModel } from "@angular/cdk/collections";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { Component, Inject, Injectable, NgZone, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { take } from "rxjs/operators";
import { IPerfil } from "src/app/shared/model/perfil";
import { IFiltroServentiaPerfil, ISelectPermissao, IServentiaPermissoes, IServentiaPermissoesData } from "src/app/shared/model/serventia";
import { IUsuario } from "src/app/shared/model/usuario";
import { UtilsService } from "src/app/shared/utils.service";
import { GestaoUsuariosService } from "../gestao-usuarios.service";

@Injectable({
  providedIn: "root",
})
@Component({
  selector: "app-gestao-serventias-modal",
  styleUrls: ["./gestao-serventias-modal.component.css"],
  templateUrl: "./gestao-serventias-modal.component.html",
})
export class GestaoServentiasModalComponent implements OnInit {

  public displayedColumns: string[] = ["razaoSocial", "TV", "TA", "IV", "IA"];
  public dataSource = new MatTableDataSource<IServentiaPermissoes>();
  public form: FormGroup;
  @ViewChild("autosize") public autosize: CdkTextareaAutosize;
  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  public selectionTV: SelectionModel<IServentiaPermissoes> = new SelectionModel<IServentiaPermissoes>(true, []);
  public selectionTA: SelectionModel<IServentiaPermissoes> = new SelectionModel<IServentiaPermissoes>(true, []);

  public selectionIV: SelectionModel<IServentiaPermissoes> = new SelectionModel<IServentiaPermissoes>(true, []);
  public selectionIA: SelectionModel<IServentiaPermissoes> = new SelectionModel<IServentiaPermissoes>(true, []);

  public tLabel: string;
  public iLabel: string;

  public titular: ISelectPermissao[];
  public interino: ISelectPermissao[];

  public usuario: IUsuario;
  public perfil: IPerfil;
  public listaServentia: IServentiaPermissoes[];

  private criarFormulario(filtroForm: IFiltroServentiaPerfil): void {
    this.form = this.fb.group({
      interino: [filtroForm.interino],
      login: [{ value: filtroForm.login, disabled: true }],
      name: [{ value: filtroForm.name, disabled: true }],
      perfil: [{ value: filtroForm.perfil, disabled: true }],
      serventia: [filtroForm.serventia],
      titular: [filtroForm.titular],
    });
  }

  constructor(
    public dialogRef: MatDialogRef<GestaoServentiasModalComponent>,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private gestaoUsuariosService: GestaoUsuariosService,
    private ngxLoader: NgxUiLoaderService,
    private utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  public ngOnInit(): void {
    this.carregaDados();
    this.listarServentias();
    this.iniciaFiltro();
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public salvar(): void {

    const senventiasSalvar: IServentiaPermissoes[] = [];
    this.dataSource.data.forEach((element) => {
      this.selectionTV.isSelected(element) ? element.titularVisualizacao = true : element.titularVisualizacao = false;
      this.selectionTA.isSelected(element) ? element.titularAnalise = true : element.titularAnalise = false;
      this.selectionIA.isSelected(element) ? element.interinoAnalise = true : element.interinoAnalise = false;
      this.selectionIV.isSelected(element) ? element.interinoVisualizacao = true : element.interinoVisualizacao = false;

      const params = {
        idServentia: element.idServentia,
        interinoAnalise: element.interinoAnalise,
        interinoVisualizacao: element.interinoVisualizacao,
        razaoSocial: "",
        titularAnalise: element.titularAnalise,
        titularVisualizacao: element.titularVisualizacao,
      };

      if (params.titularVisualizacao || params.titularAnalise || params.interinoAnalise || params.interinoVisualizacao) {
        senventiasSalvar.push(params);
      }

    });

    this.ngxLoader.start();

    this.gestaoUsuariosService.putServentiasUsuario(this.usuario.idUsuario,
                this.perfil.idPerfilPortalExtrajud, senventiasSalvar).subscribe((success) => {
      this.ngxLoader.stop();
      this.gestaoUsuariosService.setIsServentiaAtualizado(true);
      this.gestaoUsuariosService.setIsGestaoUsuariosAtualizado(true);
      this.utils.showDialogMessage("Serventias atualizadas com sucesso!");
    }, (error) => {
      this.ngxLoader.stop();
      this.utils.showDialogError(error);
    });

  }

  public triggerResize(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  private carregaDados(): void {
    this.usuario = this.data.usuario;
    this.perfil = this.data.perfil;

    const filtroForm: IFiltroServentiaPerfil = {};
    filtroForm.login = this.usuario.login;
    filtroForm.name = this.usuario.name;
    filtroForm.perfil = this.perfil.nome;
    filtroForm.serventia = "";
    filtroForm.titular = null;
    filtroForm.interino = null;

    this.criarFormulario(filtroForm);

    this.tLabel = this.perfil.nome === "Revisor" ? "Titular Revisão" : "Titular Análise";
    this.iLabel = this.perfil.nome === "Revisor" ? "Interino Revisão" : "Interino Análise";

    this.titular = [
      { value: null, viewValue: "Selecione" },
      { value: "V", viewValue: "Visualização" },
      { value: "A", viewValue: this.perfil.nome === "Revisor" ? "Revisão" : "Análise" },
      { value: "NDA", viewValue: "Sem Permissão" },
    ];

    this.interino = [
      { value: null, viewValue: "Selecione" },
      { value: "V", viewValue: "Visualização" },
      { value: "A", viewValue: this.perfil.nome === "Revisor" ? "Revisão" : "Análise" },
      { value: "NDA", viewValue: "Sem Permissão"},

    ];
  }

  private listarServentias(): void {
    this.gestaoUsuariosService.getListaServentiasByLoginAndPerfil(this.usuario.idUsuario,
                  this.perfil.idPerfilPortalExtrajud).subscribe((res: IServentiaPermissoesData) => {
      this.listaServentia = res.data;
      this.listaServentia
        .forEach((item) => {
          item.titularAnalise ? this.selectionTA.select(item) : this.selectionTA.deselect(item);
          item.titularVisualizacao ? this.selectionTV.select(item) : this.selectionTA.isSelected(item)
                ? this.selectionTV.select(item) : this.selectionTV.deselect(item);
          item.interinoAnalise ? this.selectionIA.select(item) : this.selectionIA.deselect(item);
          item.interinoVisualizacao ? this.selectionIV.select(item) : this.selectionIA.isSelected(item)
                ? this.selectionIV.select(item) : this.selectionIV.deselect(item);
        });

      this.dataSource = new MatTableDataSource(res.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.customFilterPredicate();
    }, (error) => {
      this.utils.showDialogError(error);
    });

  }

  public toggle(componente: number, row?: IServentiaPermissoes): void {
    switch (componente) {
      case 0:
        this.selectionTV.toggle(row);
        if (!this.selectionTV.isSelected(row) && this.selectionTA.isSelected(row)) {
          this.selectionTA.deselect(row);
        }

        if (this.selectionTV.isSelected(row)) {
          this.dataSource.data
              .filter((item) => item.idServentia === row.idServentia)
              .map((item) => {item.titularVisualizacao = true; return item; });
        } else {
          this.dataSource.data
              .filter((item) => item.idServentia === row.idServentia)
              .map((item) => {item.titularVisualizacao = false; item.titularAnalise = false; return item; });
        }

        break;
      case 1:
        this.selectionTA.toggle(row);
        if (this.selectionTA.isSelected(row) && !this.selectionTV.isSelected(row)) {
          this.selectionTV.toggle(row);
        }

        if (this.selectionTA.isSelected(row)) {
          this.dataSource.data
            .filter((item) => item.idServentia === row.idServentia)
            .map((item) => {item.titularVisualizacao = true; item.titularAnalise = true; return item; });
        } else {
          this.dataSource.data
            .filter((item) => item.idServentia === row.idServentia)
            .map((item) => {item.titularAnalise = false; return item; });
        }

        break;
      case 2:
        this.selectionIV.toggle(row);
        if (!this.selectionIV.isSelected(row) && this.selectionIA.isSelected(row)) {
          this.selectionIA.deselect(row);
        }

        if (this.selectionIV.isSelected(row)) {
          this.dataSource.data
            .filter((item) => item.idServentia === row.idServentia)
            .map((item) => {item.interinoVisualizacao = true; return item; });
        } else {
          this.dataSource.data
            .filter((item) => item.idServentia === row.idServentia)
            .map((item) => {item.interinoVisualizacao = false; item.interinoAnalise = false; return item; });
        }

        break;
      case 3:
        this.selectionIA.toggle(row);
        if (this.selectionIA.isSelected(row) && !this.selectionIV.isSelected(row)) {
          this.selectionIV.toggle(row);
        }

        if (this.selectionIA.isSelected(row)) {
          this.dataSource.data
            .filter((item) => item.idServentia === row.idServentia)
            .map((item) => {item.interinoVisualizacao = true; item.interinoAnalise = true; return item; });
        } else {
          this.dataSource.data
            .filter((item) => item.idServentia === row.idServentia)
            .map((item) => {item.interinoAnalise = false; return item; });
        }

        break;
    }
  }

  public isAllSelected(componente: number): boolean {
    let numSelected: number;
    switch (componente) {
      case 0:
        numSelected = this.selectionTV.selected.length;
        break;
      case 1:
        numSelected = this.selectionTA.selected.length;
        break;
      case 2:
        numSelected = this.selectionIV.selected.length;
        break;
      case 3:
        numSelected = this.selectionIA.selected.length;
        break;
    }
    const numRows = this.dataSource?.data.length;
    return numSelected === numRows;
  }

  public masterToggle(componente: number): void {
    switch (componente) {
      case 0:
        if (this.isAllSelected(0)) {
          this.selectionTV.clear();
          this.selectionTA.clear();
          this.dataSource.data.forEach((row: IServentiaPermissoes) => { row.titularVisualizacao = false; row.titularAnalise = false;  });
        } else {
          this.dataSource.data.forEach((row: IServentiaPermissoes) => { this.selectionTV.select(row); row.titularVisualizacao = true; });
        }
        break;

      case 1:
        if (this.isAllSelected(1)) {
          this.selectionTA.clear();
          this.dataSource.data.forEach((row: IServentiaPermissoes) => { row.titularAnalise = false; });
        } else {
          this.dataSource.data
            .forEach((row: IServentiaPermissoes) => {
                this.selectionTA.select(row);
                this.selectionTV.select(row);
                row.titularAnalise = true;
                row.titularVisualizacao = true;
          });
        }
        break;

      case 2:
        if (this.isAllSelected(2)) {
          this.selectionIV.clear();
          this.selectionIA.clear();
          this.dataSource.data.forEach((row: IServentiaPermissoes) => { row.interinoVisualizacao = false; row.interinoAnalise = false; });
        } else {
          this.dataSource.data.forEach((row: IServentiaPermissoes) => { this.selectionIV.select(row); row.interinoVisualizacao = true; });
        }
        break;

      case 3:
        if (this.isAllSelected(3)) {
          this.selectionIA.clear();
          this.dataSource.data.forEach((row: IServentiaPermissoes) => { row.interinoAnalise = false; });
        } else {
          this.dataSource.data.forEach((row: IServentiaPermissoes) => {
            this.selectionIA.select(row);
            this.selectionIV.select(row);
            row.interinoAnalise = true;
            row.interinoVisualizacao = true;
         });
        }

        break;
    }
  }

  private iniciaFiltro(): void {
    this.form.valueChanges.subscribe((val: IFiltroServentiaPerfil) => {
      this.dataSource.filter = JSON.stringify(this.form.value);
    });
  }

  public customFilterPredicate(): (data: IServentiaPermissoes, filter: string) => boolean {
    const myFilterPredicate = (data: IServentiaPermissoes, filter: string) => {

      const searchString: IFiltroServentiaPerfil = JSON.parse(filter);

      if (searchString.titular == null && searchString.interino == null && searchString.serventia.toString() === "") {
        return true;
      }

      const semAcessoTitular: boolean = !data.titularVisualizacao && !data.titularAnalise;
      const semAcessoInterino: boolean = !data.interinoVisualizacao && !data.interinoAnalise;
      const semAcesso: boolean = semAcessoTitular && semAcessoInterino && searchString.titular !== "NDA" && searchString.interino !== "NDA";

      if (semAcesso && searchString.serventia.toString() === "") {
        return false;
      }

      const titularAnalise: boolean = data.titularAnalise && data.titularVisualizacao;
      const titularVisualizacao: boolean  = data.titularVisualizacao && !data.titularAnalise;
      const interinoAnalise: boolean = data.interinoAnalise && data.interinoVisualizacao;
      const interinoVisualizacao: boolean  = data.interinoVisualizacao && !data.interinoAnalise;

      const serventia = searchString.serventia.toString() === ""
        ? true
        : data.razaoSocial
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.serventia.toString().trim().toLowerCase()) !== -1;

      const titularAnaliseFound = searchString.titular === null
          || searchString.interino != null
          || titularVisualizacao
          || searchString.titular === "NDA"
        ? true : (searchString.titular === "A" && titularAnalise);

      const titularVisualizacaoFound =  searchString.titular === null
          || searchString.interino != null
          || titularAnalise
          || searchString.titular === "NDA"
        ? true : (searchString.titular === "V" && titularVisualizacao) ;

      const interinoAnaliseFound = searchString.interino === null
          || searchString.titular != null
          || interinoVisualizacao
          || searchString.interino === "NDA"
        ? true : searchString.interino === "A" && interinoAnalise;

      const interinoVisualizacaoFound = searchString.interino === null
          || searchString.titular != null
          || interinoAnalise
          || searchString.interino === "NDA"
        ? true : searchString.interino === "V" && interinoVisualizacao;

      const semAcessoTitularFound = searchString.titular === null || searchString.titular !== "NDA"
        ? true
        : searchString.titular === "NDA" && semAcessoTitular;

      const semAcessoInterinoFound = searchString.interino === null || searchString.interino !== "NDA"
        ? true
        : searchString.interino === "NDA" && semAcessoInterino;

      return serventia
          && titularAnaliseFound
          && titularVisualizacaoFound
          && interinoAnaliseFound
          && interinoVisualizacaoFound
          && semAcessoTitularFound
          && semAcessoInterinoFound;
    };
    return myFilterPredicate;
  }

}
