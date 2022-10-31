import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ContratosAutorizacoesComponent } from "./contratos-autorizacoes.component";

describe("ContratosAutorizacoesComponent", () => {
  let component: ContratosAutorizacoesComponent;
  let fixture: ComponentFixture<ContratosAutorizacoesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContratosAutorizacoesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratosAutorizacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
