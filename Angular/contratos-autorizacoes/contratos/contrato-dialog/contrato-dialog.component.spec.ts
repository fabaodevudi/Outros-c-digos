import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ContratoDialogComponent } from "./contrato-dialog.component";

describe("ContratoDialogComponent", () => {
  let component: ContratoDialogComponent;
  let fixture: ComponentFixture<ContratoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContratoDialogComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
