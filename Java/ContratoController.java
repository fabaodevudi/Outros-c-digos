package br.extratomensal.api.controllers;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.AgrupamentoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.ContratoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.FiltroContratoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.IndiceCorrecaoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.MotivoGlosaDTO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@Api
@RestController
@RequestMapping(path = "/rest/contratos", produces = MediaType.APPLICATION_JSON_VALUE)
public interface ContratoController {
	
	@ApiOperation(value = "Criar contrato", notes = "Grava na tabela contratos, além de gerar os históricos do contrato e demais entidade relacionadas e de gravar arquivos no edocs e os documentos na tabela de documentos.")
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	void adicionarContrato(@RequestParam("contrato") String novo,
			@RequestParam("tipos") Long[] tiposArquivos,
    		@RequestParam("dados") MultipartFile[] arquivos);
	
	@ApiOperation(value = "Agrupar dados do contrato por grupo, subgrupo e despesa.")
	@PutMapping
	AgrupamentoDTO agrupamento(@RequestBody FiltroContratoDTO filtro);
	
	@ApiOperation(value = "Listar índices de correção do contrato",	notes = "Retorna a lista de índices do contrato")
	@GetMapping("/indices")
	List<IndiceCorrecaoDTO> getIndices();	
	
	@ApiOperation(value = "Excluir contrato", notes = "Exclui contrato e gera histórico.")
	@DeleteMapping("/{id}")
	void excluir(@PathVariable("id") Long idContrato);
	
	@ApiOperation(value = "Recuperar contrato", notes = "Recupera contrato")
	@GetMapping("/{id}")
	ContratoDTO getContrato(@PathVariable("id") Long id);	
	
	@ApiOperation(value = "Editar contrato", notes = "Edita contrato e gera histórico do contrato, além de editar os arquivos no edocs e na tabela de documentos.")
	@PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	void editarContrato(@PathVariable("id") Long id,
			@RequestParam("contrato") String editar,
    		@RequestParam(value = "acoes", required = false) Integer[] acoesArquivos,
    		@RequestParam(value = "ids", required = false) Long[] idTipoOuIdDocumento,
    		@RequestParam(value = "dados", required = false) MultipartFile[] arquivos);
	
	@ApiOperation(value = "Listar motivos de glosa do contrato", notes = "Lista os motivos de glosa do contrato.")
	@GetMapping("/{id}/motivos")
	List<MotivoGlosaDTO> listarMotivos(@PathVariable("id") Long idContrato);
	
}
