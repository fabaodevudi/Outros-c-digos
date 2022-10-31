import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { Overlay } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { InjectionToken } from "@angular/core";
import { MAT_DIALOG_SCROLL_STRATEGY, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UploadDocumentosComponent } from "./upload-documentos.component";

describe("UploadDocumentosComponent", () => {
  let component: UploadDocumentosComponent;
  let fixture: ComponentFixture<UploadDocumentosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDocumentosComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ MatDialog, Overlay, MatSnackBar,
        { provide: InjectionToken, useValue: {} },
        { provide: MAT_DIALOG_SCROLL_STRATEGY, useValue: {} },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
