import { Overlay } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { InjectionToken } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MAT_DIALOG_SCROLL_STRATEGY, MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of } from "rxjs/internal/observable/of";

import { GestaoUsuariosService } from "../gestao-usuarios.service";

import { IPerfil } from "src/app/shared/model/perfil";
import { GestaoServentiasModalComponent } from "./gestao-serventias-modal.component";

describe("GestaoServentiasModalComponent", () => {
  let component: GestaoServentiasModalComponent;
  let fixture: ComponentFixture<GestaoServentiasModalComponent>;
  const mockGestaoUsuariosService = jasmine.createSpyObj("Obj", ["getPerfilSelecionado", "getUsuarioPerfil", "getListaServentias"]);
  const mockPerfil: IPerfil = { descricao: "desc",  idPerfilPortalExtrajud: 123 , nome: "Nome", marcado: false };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GestaoServentiasModalComponent],
      imports: [ HttpClientTestingModule, MatDialogModule ],
      providers: [ FormBuilder, MatDialog, Overlay, MatSnackBar,
        { provide: MatDialogRef, useValue: {} },
        { provide: InjectionToken, useValue: {} },
        { provide: MAT_DIALOG_SCROLL_STRATEGY, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { login: "name", perfis: [] } },
        { provide: GestaoUsuariosService, useValue: mockGestaoUsuariosService },

      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestaoServentiasModalComponent);
    component = fixture.componentInstance;
    mockGestaoUsuariosService.getPerfilSelecionado.and.returnValue(mockPerfil);
    mockGestaoUsuariosService.getUsuarioPerfil.and.returnValue(of({ data: [] }));
    mockGestaoUsuariosService.getListaServentias.and.returnValue(of({ data: [] }));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
