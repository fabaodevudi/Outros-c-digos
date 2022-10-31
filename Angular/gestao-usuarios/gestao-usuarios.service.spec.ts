import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { GestaoUsuariosService } from "./gestao-usuarios.service";

describe("GestaoUsuarioService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
  }));

  it("should be created", () => {
    const service: GestaoUsuariosService = TestBed.inject(GestaoUsuariosService);
    expect(service).toBeTruthy();
  });
});
