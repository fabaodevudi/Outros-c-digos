import { SelectionModel } from "@angular/cdk/collections";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { Component, Inject, Injectable, NgZone, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { take } from "rxjs/operators";
import { IPerfil } from "src/app/shared/model/perfil";
import { UtilsService } from "src/app/shared/utils.service";
import { GestaoServentiasModalComponent } from "../gestao-serventias-modal/gestao-serventias-modal.component";
import { GestaoUsuariosService } from "../gestao-usuarios.service";

import { DialogConfirmationComponent } from "src/app/core/dialog-confirmation/dialog-confirmation.component";
import { IUsuario, IUsuarioData, IUsuarioPerfis, IUsuarioPerfisData } from "src/app/shared/model/usuario";

@Injectable({
  providedIn: "root",
})
@Component({
  selector: "app-gestao-perfis-modal",
  styleUrls: ["./gestao-perfis-modal.component.css"],
  templateUrl: "./gestao-perfis-modal.component.html",
})
export class GestaoPerfisModalComponent implements OnInit {
  @ViewChild(MatPaginator) public paginator: MatPaginator;
  public selection: SelectionModel<IPerfil> = new SelectionModel<IPerfil>(true, []);

  constructor(
    public dialogRef: MatDialogRef<GestaoPerfisModalComponent>,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private gestaoUsuarioService: GestaoUsuariosService,
    private ngxLoader: NgxUiLoaderService,
    private utils: UtilsService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: IUsuarioPerfis,
  ) {
      this.usuario = this.data.usuario;
      this.listaPerfil = this.data.perfis;

   }

  @ViewChild("autosize") public autosize: CdkTextareaAutosize;

  public form: FormGroup;
  public usuario: IUsuario;
  public listaPerfil: IPerfil[] = [];
  public listaPerfilDataSource: IPerfil[] = [];
  public dataSource = new MatTableDataSource<IPerfil>();
  public displayedColumns: string[] = ["perfil", "select", "acoes"];
  public isSave = true;

  private criarFormulario(usuario: IUsuario): void {
    this.form = this.fb.group({
      login: [{ value: usuario.login, disabled: true }],
      name: [{ value: usuario.name, disabled: true }],
    });
  }

  public isEdicao(): boolean {
    return this.usuario != null;
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public triggerResize(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public ngOnInit(): void {
    this.criaUsuario();
    this.criarFormulario(this.usuario);
  }

  private criaUsuario(): void {
    this.gestaoUsuarioService.postUsuario(this.usuario.login).subscribe((res) => {
      this.getPerfisByUsuario(res.data.idUsuario);
    }, (error) => {
      this.utils.showDialogError(error);
      this.isSave = false;
    });
  }

  private getPerfisByUsuario(idUsuario: number): void {
    this.gestaoUsuarioService.getListaPerfilByUsuario(idUsuario).subscribe((res: IUsuarioPerfisData) => {
      this.listaPerfilDataSource = Array.from(res.data.perfis);
      res.data.perfis.forEach((itemPerfilUsuario) => {
        this.listaPerfil
          .filter((item) => item.idPerfilPortalExtrajud === itemPerfilUsuario.idPerfilPortalExtrajud)
          .map((item) => { item.marcado = true; return item; })
          .forEach((item) => this.selection.select(item));
      });
      this.dataSource = new MatTableDataSource(this.listaPerfil);
      this.usuario.idUsuario = res.data.idUsuario;
      this.dataSource.paginator = this.paginator;
    }, (error) => {
      this.utils.showDialogError(error);
    });
  }

  public isAlterado(): boolean {
    let retorno = false;
    if (this.selection.selected.length !== this.listaPerfilDataSource.length) {
      retorno = true;
      return retorno;
    }

    this.selection.selected.forEach((itemSelecionado) => {
      let perfilBuscado: IPerfil = {};
      perfilBuscado = this.listaPerfilDataSource.find((item) => item.idPerfilPortalExtrajud === itemSelecionado.idPerfilPortalExtrajud);
      if (perfilBuscado == null) {
        retorno = true;
        return retorno;
      }
    });

    this.listaPerfilDataSource.forEach((itemData) => {
      let perfilBuscado: IPerfil = {};
      perfilBuscado = this.selection.selected.find((item) => item.idPerfilPortalExtrajud === itemData.idPerfilPortalExtrajud);
      if (perfilBuscado == null) {
        retorno = true;
        return retorno;
      }
    });

    return retorno;
  }

  public editPerfilServentia(perfil: IPerfil): void {
    if (this.isAlterado()) {
      const dialogRef = this.dialog.open(DialogConfirmationComponent, {
        autoFocus: false,
        data: {
          content: `As alterações realizadas nos perfis do usuário ainda não foram salvas. `
          + `Ao acessar a tela de liberação de serventias todas as alterações serão salvas automaticamente. Desejas continuar?`,
          title: "Confirmação",
        },
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.salvar();
          this.openModalServentias(perfil);
        }
      });
    } else {
      this.openModalServentias(perfil);
    }
  }

  private openModalServentias(perfil: IPerfil): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      perfil,
      usuario: this.usuario,
    };

    dialogConfig.minWidth = "1200px";
    const dialogRef = this.dialog.open(GestaoServentiasModalComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      const isServentiasAtualizado: boolean = this.gestaoUsuarioService.getIsServentiaAtualizado() != null
                              && this.gestaoUsuarioService.getIsServentiaAtualizado() ? true : false;
      if (isServentiasAtualizado) {
        this.getPerfisByUsuario(this.usuario.idUsuario);
      }
      sessionStorage.removeItem("isServentiaAtualizado");
    });
  }

  public toggle(row?: IPerfil): void {
    this.selection.toggle(row);
    if (!this.selection.isSelected(row)) {
      this.gestaoUsuarioService.countServentiasPerfil(this.usuario.idUsuario, row.idPerfilPortalExtrajud).subscribe((success) => {
        // tslint:disable-next-line: radix
        if (Number.parseInt(success.data) > 0) {
          const dialogRef = this.dialog.open(DialogConfirmationComponent, {
            autoFocus: false,
            data: {
              content: `Este perfil possui serventias liberadas para visualização e/ou análise. `
              + `Excluindo este perfil do usuário o cadastro das serventias será perdido. Desejas continuar?`,
              title: "Confirmação",
            },
          });

          dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
              dialogRef.close(true);
            } else {
              this.selection.select(row);
            }
          });
        }

      }, (error) => {
        this.utils.showDialogError(error);
      });
    }
  }

  public salvar(): void {
    const perfisMarcados = this.selection.selected;
    this.ngxLoader.start();
    this.gestaoUsuarioService.putPerfisUsuario(this.usuario.idUsuario, perfisMarcados).subscribe((success) => {
      this.ngxLoader.stop();
      this.gestaoUsuarioService.setIsGestaoUsuariosAtualizado(true);
      this.utils.showDialogMessage("Perfil gravado com sucesso!");
    }, (error) => {
      this.ngxLoader.stop();
      this.utils.showDialogError(error);
    });
  }

  public checkboxLabel(row?: IPerfil): string {
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.nome + 1}`;
  }

}
