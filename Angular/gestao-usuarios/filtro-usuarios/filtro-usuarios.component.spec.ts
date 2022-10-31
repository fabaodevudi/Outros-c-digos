import { Overlay } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { InjectionToken } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_SCROLL_STRATEGY, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterTestingModule } from "@angular/router/testing";
import { FiltroUsuariosComponent } from "./filtro-usuarios.component";

describe("FiltroPerfisComponent", () => {
  let component: FiltroUsuariosComponent;
  let fixture: ComponentFixture<FiltroUsuariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltroUsuariosComponent ],
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      providers: [ FormBuilder, MatDialog, Overlay, MatSnackBar,
        { provide: InjectionToken, useValue: {} },
        { provide: MAT_DIALOG_SCROLL_STRATEGY, useValue: {} },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltroUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
