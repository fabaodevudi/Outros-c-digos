import { HttpErrorResponse, HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { saveAs } from "file-saver";
import { BehaviorSubject } from "rxjs";
import { ITipoDocumento, ITiposDocumentoData } from "src/app/shared/model/tipo-documento";
import { UtilsService } from "src/app/shared/utils.service";

import { MatTableDataSource } from "@angular/material/table";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { UploadDocumentosService } from "./upload-documentos.service";

import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { IDocumentoPrestacaoContas, IDocumentoPrestacaoContasData } from "src/app/shared/model/documentos-prestacao-contas";

@Component({
  selector: "app-upload-documentos",
  styleUrls: ["./upload-documentos.component.css"],
  templateUrl: "./upload-documentos.component.html",
})
export class UploadDocumentosComponent implements OnInit, OnChanges {
  constructor(
    private serv: UploadDocumentosService ,
    private fb: FormBuilder,
    private utils: UtilsService,
    private ngxLoader: NgxUiLoaderService,

  ) {}

  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) public sort: MatSort;
  @Input() public tipo = "";
  @Input() public isAditivo = false;
  @Input() public idRegistro = 0; // input para receber o idContrato
  @Output() public documentosUpdated: EventEmitter<IDocumentoPrestacaoContas[]> = new EventEmitter<IDocumentoPrestacaoContas[]>();
  public displayedColumns: string[] = ["name", "tipo", "upload", "download", "excluir"];

  public dataSource = new MatTableDataSource<IDocumentoPrestacaoContas>();
  private documentos: BehaviorSubject<IDocumentoPrestacaoContas[]>;
  public tiposDocumento: ITipoDocumento[] = [];
  public qtdNoUploaded = 0;
  public mode = "determinate";

  public tipoDocumentoSelecionado: ITipoDocumento = {};
  public isEnabledUpload = true;

  public form: FormGroup = this.fb.group({
    name: [""],
    tipo: [""],
    upload: [""],
  });

  public loadTiposDocumentoContrato(): void {
    this.serv.getTiposDocumentoContrato().subscribe((res: ITiposDocumentoData) => {
      this.tiposDocumento = res.data;
      if (this.isAditivo) {
        this.tipoDocumentoSelecionado = this.tiposDocumento.find((item) => item.descricao.toUpperCase() === "Aditivo".toUpperCase());
      } else {
        this.tipoDocumentoSelecionado = this.tiposDocumento.find((item) => item.descricao.toUpperCase() === "Contrato".toUpperCase());
      }
    }, (error: HttpErrorResponse) => {
      this.utils.showDialogError(error);
    });
  }

  public loadTiposDocumentoAutorizacao(): void {
    this.serv.getTiposDocumentoAutorizacao().subscribe((res: ITiposDocumentoData) => {
      this.tiposDocumento = res.data;
      this.tipoDocumentoSelecionado = this.tiposDocumento[0];
    }, (error: HttpErrorResponse) => {
      this.utils.showDialogError(error);
    });
  }

  public loadDocumentosContrato(): void {
    this.ngxLoader.startLoader("loaderDocumentos");
    this.serv.getDocumentosContrato(this.idRegistro).subscribe((res: IDocumentoPrestacaoContasData) => {
      this.setDocumentos(res.data);
      this.dataSource = new MatTableDataSource<IDocumentoPrestacaoContas>(res.data);
      if (this.isAditivo) {
        this.isEnabledUpload = !res.data.find((item) => item.idDocumento == null &&
                item.tipo.descricao.toUpperCase() === "Aditivo".toUpperCase());
      } else {
        this.isEnabledUpload = !res.data.find((item) => item.tipo.descricao.toUpperCase() === "Contrato".toUpperCase());
      }
      this.ngxLoader.stopLoader("loaderDocumentos");
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderDocumentos");
      this.utils.showDialogError(error);
    });
  }

  public loadDocumentosAutorizacao(): void {
    this.ngxLoader.startLoader("loaderDocumentos");
    this.serv.getDocumentosAutorizacao(this.idRegistro).subscribe((res: IDocumentoPrestacaoContasData) => {
      this.setDocumentos(res.data);
      this.dataSource = new MatTableDataSource<IDocumentoPrestacaoContas>(res.data);
      this.isEnabledUpload = !res.data.find((item) => item.tipo.descricao.toUpperCase() === "Autorização".toUpperCase());
      this.ngxLoader.stopLoader("loaderDocumentos");
    }, (error: HttpErrorResponse) => {
      this.ngxLoader.stopLoader("loaderDocumentos");
      this.utils.showDialogError(error);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {

  }

  public ngOnInit(): void {
    if (this.tipo === "C") {
      if (this.idRegistro != null) {
        this.loadDocumentosContrato();
      }
      this.loadTiposDocumentoContrato();
    } else if (this.tipo === "A") {
      if (this.idRegistro != null) {
        this.loadDocumentosAutorizacao();
      }
      this.loadTiposDocumentoAutorizacao();
    }

    this.documentos = new BehaviorSubject<IDocumentoPrestacaoContas[]>([]);
    this.documentos.subscribe((data: IDocumentoPrestacaoContas[]) => this.documentosUpdated.emit(data));
  }

  public getDocumentos(): IDocumentoPrestacaoContas[] {
    return this.documentos.value;
  }

  public getDocumentosVisiveis(): IDocumentoPrestacaoContas[] {
    return this.documentos.value.filter((doc) => doc.adicionar !== false);
  }

  public setDocumentos(value: IDocumentoPrestacaoContas[]): void {
    this.qtdNoUploaded = value.filter((d: IDocumentoPrestacaoContas) => d.idDocumento === null).length;
    this.documentos.next(value);
  }

  public setTipoDocumento(): void {
    this.refreshDocumentos();
  }

  public isRemovable(documento: IDocumentoPrestacaoContas): boolean {
    let removable = true;
    if (this.tipo === "C") {
      removable = !(this.isAditivo && documento.idDocumento != null) || !this.isAditivo;
      return removable;
    } else if (this.tipo === "A") {
      removable = true;
      return removable;
    }
    return removable;
  }

  public refreshDocumentos(): void {
    this.setDocumentos(this.documentos.value);
  }

  public onSelect(event): void {
    const files: File[] = event.addedFiles;
    const rejeitados: File[] = event.rejectedFiles;
    if (rejeitados !== undefined && rejeitados.length > 0) {
      this.utils.showDialogMessage("Não é permitido fazer upload desse tipo de arquivo, " +
           "são aceitos apenas arquivos: pdf, bmp e jpg, e que sejam menores que 5MB.");
    } else if (files && files.length > 1) {
      this.utils.showDialogMessage("Não é permitido fazer upload de múltiplos arquivos.");
    } else if (files) {
      files.forEach((f: File) => {
        this.getDocumentos().push({
          adicionar: true,
          dataUpload: null,
          file: f,
          idDocumento: null,
          nomeArquivo: f.name,
          permiteExclusao: "S",
          progress: 0,
          tipo: {} as ITipoDocumento,
        });
      });
      this.upload();
    }
  }

  public onDownload(documento: IDocumentoPrestacaoContas): void {
    const idx = this.getDocumentosVisiveis().indexOf(documento);
    this.ngxLoader.startLoader("loaderDocumentos");
    if (documento.idDocumento !== null) {
      this.mode = "query";
      this.getDocumentosVisiveis()[idx].progress = 50;
      this.serv.getDocumento(documento).subscribe((response) => {
        const contentDisposition = response.headers.get("content-disposition") || "";
        const matches = /filename=([^;]+)/gi.exec(contentDisposition);
        const fileName = matches[1] ? matches[1].slice(1, -1).trim() : "untitled";
        this.mode = "determinate";
        this.getDocumentosVisiveis()[idx].progress = 100;
        this.ngxLoader.stopLoader("loaderDocumentos");
        saveAs(response.body, fileName);
      }, (error: HttpErrorResponse) => {
        this.getDocumentosVisiveis()[idx].progress = 0;
        this.utils.showDialogMessage("Erro ao recuperar o arquivo com o ID " + documento.idDocumento + ".");
        this.ngxLoader.stopLoader("loaderDocumentos");
      });
    } else {
      saveAs(documento.file);
    }
  }

  public canUpload(): boolean {
    let doc: IDocumentoPrestacaoContas[] = [];
    if (this.tipo === "C" && !this.isAditivo) {
      doc = this.getDocumentosVisiveis().filter((item) => item.tipo.tipo === "C" &&
          item.tipo.descricao.toUpperCase() === "Contrato".toUpperCase());
    } else if (this.tipo === "A") {
      doc = this.getDocumentosVisiveis().filter((item) => item.tipo.tipo === "A" &&
          item.tipo.descricao.toUpperCase() === "Autorizacao".toUpperCase());
    } else if (this.isAditivo) {
      return true;
    }
    return doc.length === 0;
  }

  public onRemove(documento: IDocumentoPrestacaoContas): void {
    const idx = this.getDocumentos().indexOf(documento);
    if (documento.idDocumento !== null) {
      this.utils
        .showDialogConfirmation({
          content: `Desejas realmente excluir o documento <b>${documento.nomeArquivo}</b>?`,
          title: "Confirmação",
        })
        .subscribe((result) => {
          if (result) {
            this.getDocumentos()[idx].adicionar = false;
            this.refreshDocumentos();
            this.isEnabledUpload = this.canUpload();
          }
        });
    } else {
      this.getDocumentos().splice(idx, 1);
      this.refreshDocumentos();
      this.isEnabledUpload = this.canUpload();
    }

  }

  public upload(): void {
    const uploads = [];
    this.getDocumentos()
      .filter((d: IDocumentoPrestacaoContas) => d.idDocumento === null)
      .forEach((documento: IDocumentoPrestacaoContas) => {
        documento.tipo = this.tipoDocumentoSelecionado;
        const idx = this.getDocumentos().indexOf(documento);
        uploads.push({ documento, idx });
        this.setDocumentos(this.getDocumentos());
        this.isEnabledUpload = false;
      });
  }
}
