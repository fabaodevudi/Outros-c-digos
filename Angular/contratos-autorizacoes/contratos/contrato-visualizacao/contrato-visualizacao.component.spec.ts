import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ContratoVisualizacaoComponent } from "./contrato-visualizacao.component";

describe("ContratoVisualizacaoComponent", () => {
  let component: ContratoVisualizacaoComponent;
  let fixture: ComponentFixture<ContratoVisualizacaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContratoVisualizacaoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratoVisualizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
