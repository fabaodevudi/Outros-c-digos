package br.extratomensal.application.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.jus.tjrs.extrajudicial.selo.extratomensal.api.controllers.ContratoController;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.AgrupamentoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.ContratoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.DespesaMensalDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.FiltroContratoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.GrupoDespesaMensalDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.IndiceCorrecaoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.MotivoGlosaDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.NovoDocumentoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.SubgrupoDespesaMensalDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.exceptions.GeneralRuntimeException;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.services.ContratoService;

@Controller
public class ContratoControllerImpl implements ContratoController {
	
	@Autowired
	private ObjectMapper jsonMapper;	
	
	@Autowired
	private ContratoService service;
	
	@Override
	public void adicionarContrato(String json, Long[] tipos, MultipartFile[] arquivos) {
		try { 
        	List<NovoDocumentoDTO> documentos = new ArrayList<>(); 

        	for (int i = 0; i < arquivos.length; i++) {
	    		NovoDocumentoDTO dto = new NovoDocumentoDTO();
	    		dto.setAcao(NovoDocumentoDTO.ADICIONAR);
	    		dto.setIdTipoDocumento(tipos[i]);
	    		dto.setInfoArquivo(arquivos[i]);
	    		dto.setDadosArquivo(arquivos[i].getInputStream());
	    		documentos.add(dto);
	    	}
	    	
	       this.service.criaContrato(jsonMapper.readValue(json, ContratoDTO.class), documentos);
        } catch (IOException ex) {
        	throw new GeneralRuntimeException(ex);
        }     
	}
	
	@Override
	public ContratoDTO getContrato(Long id) {
		ContratoDTO contrato = this.service.getContrato(id);		
		return contrato;		
	}

	@Override
	public List<IndiceCorrecaoDTO> getIndices() {		
		return service.listaIndicesCorrecao();
	}
	

	@Override
	public void excluir(Long idContrato) {
		this.service.delete(idContrato);
	}

	@Override
	public AgrupamentoDTO agrupamento(FiltroContratoDTO filtro) {
		AgrupamentoDTO agrupamentoDTO = new AgrupamentoDTO();
		final List<GrupoDespesaMensalDTO> listGrupoDTO = service.grupoContratos(filtro).stream()
				.map(g -> GrupoDespesaMensalDTO.builder().descricao(g.getDescricao())
						.seqHierarquia(g.getSeqHierarquia()).id(g.getIdGrupoDespesaMensal())
						.subgrupoDespesa(g.getSubgrupo().stream().map(s -> SubgrupoDespesaMensalDTO.builder()
								.descricao(s.getDescricao()).seqHierarquia(s.getSeqHierarquia())
								.id(s.getIdSubgrupoDespesaMensal())
								.despesaMensalDTO(s.getDespesasMensais().stream()
										.map(d -> DespesaMensalDTO.builder().idDespesaMensal(d.getIdDespesaMensal())
												.descricao(d.getDescricao()).observacao(d.getObservacao())
												.obrigatorio(d.getObrigatorio()).nroOrdem(d.getNroOrdem())
												.seqHierarquia(d.getSeqHierarquia())
												.contratos(d.getContratos().stream().map(item -> {
													ContratoDTO dto = ContratoDTO
															.builder().identificador(item.getIdentificador())
															.id(item.getId())
															.idServentia(item.getIdServentia())
															.dataInicio(item.getDataInicio().getTime()).id(item.getId())
															.dataTermino(item.getDataTermino() != null ? item.getDataTermino().getTime() : null)
															.contratante(item.getContratante())
															.contratado(item.getContratado())
															.valor(item.getValor())
															.isEditable(item.getExtratos().isEmpty() || item.getGlosado() == 'T' || item.getGlosado() == 'N')
															.isRemovible(item.getExtratos().isEmpty()).build();
													return dto;
												}).collect(Collectors.toList())).build())
										.collect(Collectors.toList()))
								.build()).collect(Collectors.toList()))
						.build())
				.collect(Collectors.toList());
		agrupamentoDTO.setGrupoDespesaMensal(listGrupoDTO);
		return agrupamentoDTO;

	}

	@Override
	public void editarContrato(Long id, String json, Integer[] acoes, Long[] tiposOuIds, MultipartFile[] arquivos) {
		try {

        	List<NovoDocumentoDTO> documentos = new ArrayList<>();
        	if (arquivos != null) {
	        	for (int i = 0; i < arquivos.length; i++) {
	        		NovoDocumentoDTO dto = new NovoDocumentoDTO();
	        		dto.setAcao(acoes[i]);
	        		dto.setIdTipoDocumento(tiposOuIds[i]);
	        		dto.setInfoArquivo(arquivos[i]);
	        		dto.setDadosArquivo(arquivos[i].getInputStream());
	        		documentos.add(dto);
	        	}
        	}

        	this.service.editaContrato(id, jsonMapper.readValue(json, ContratoDTO.class), documentos);
        } catch (IOException ex) {
        	throw new GeneralRuntimeException(ex);
        } 
	}

	@Override
	public List<MotivoGlosaDTO> listarMotivos(Long idContrato) {
		return this.service.getMotivosGlosa(idContrato);
	}

}
