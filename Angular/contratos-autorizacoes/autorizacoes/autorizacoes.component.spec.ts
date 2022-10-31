import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AutorizacoesComponent } from "./autorizacoes.component";

describe("AutorizacoesComponent", () => {
  let component: AutorizacoesComponent;
  let fixture: ComponentFixture<AutorizacoesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorizacoesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
