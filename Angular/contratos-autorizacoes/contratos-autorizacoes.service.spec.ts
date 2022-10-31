import { TestBed } from "@angular/core/testing";

import { ContratosAutorizacoesService } from "./contratos-autorizacoes.service";

describe("ContratosAutorizacoesService", () => {
  let service: ContratosAutorizacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContratosAutorizacoesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
