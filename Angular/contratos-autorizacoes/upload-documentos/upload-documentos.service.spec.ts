import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { UploadDocumentosService } from "./upload-documentos.service";

describe("UploadDocumentosService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
  }));

  it("should be created", () => {
    const service: UploadDocumentosService = TestBed.inject(UploadDocumentosService);
    expect(service).toBeTruthy();
  });
});
