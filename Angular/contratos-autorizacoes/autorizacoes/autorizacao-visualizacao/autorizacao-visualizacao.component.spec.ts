import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AutorizacaoVisualizacaoComponent } from "./autorizacao-visualizacao.component";

describe("AutorizacaoVisualizacaoComponent", () => {
  let component: AutorizacaoVisualizacaoComponent;
  let fixture: ComponentFixture<AutorizacaoVisualizacaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorizacaoVisualizacaoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizacaoVisualizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
