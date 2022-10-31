import { Overlay } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { InjectionToken } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MAT_DIALOG_SCROLL_STRATEGY, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GestaoPerfisModalComponent } from "./gestao-perfis-modal.component";

describe("GestaoPerfisModalComponent", () => {
  let component: GestaoPerfisModalComponent;
  let fixture: ComponentFixture<GestaoPerfisModalComponent>;
  const mockUserData = { login: "loginUser" };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GestaoPerfisModalComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ FormBuilder, MatDialog, Overlay, MatSnackBar,
        { provide: MatDialogRef, useValue: {} },
        { provide: InjectionToken, useValue: {} },
        { provide: MAT_DIALOG_SCROLL_STRATEGY, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: mockUserData },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestaoPerfisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
