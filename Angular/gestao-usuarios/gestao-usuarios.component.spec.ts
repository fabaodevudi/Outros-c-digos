import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { Overlay } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { InjectionToken } from "@angular/core";
import { MAT_DIALOG_SCROLL_STRATEGY, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterTestingModule } from "@angular/router/testing";
import { GestaoUsuariosComponent } from "./gestao-usuarios.component";

describe("ExtratosMensaisComponent", () => {
  let component: GestaoUsuariosComponent;
  let fixture: ComponentFixture<GestaoUsuariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestaoUsuariosComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      providers: [ MatDialog, Overlay, MatSnackBar,
        { provide: InjectionToken, useValue: {} },
        { provide: MAT_DIALOG_SCROLL_STRATEGY, useValue: {} },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestaoUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
