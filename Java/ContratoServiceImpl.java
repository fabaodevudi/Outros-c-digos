package br.extratomensal.impl.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.extratomensal.api.domain.dto.ContratoDTO;
import br.extratomensal.api.domain.dto.DocumentoDTO;
import br.extratomensal.api.domain.dto.FiltroContratoDTO;
import br.extratomensal.api.domain.dto.IndiceCorrecaoDTO;
import br.extratomensal.api.domain.dto.MotivoGlosaDTO;
import br.extratomensal.api.domain.dto.NovoDocumentoDTO;
import br.extratomensal.api.domain.entities.Contrato;
import br.extratomensal.api.domain.entities.ContratoIndiceCorrecao;
import br.extratomensal.api.domain.entities.DespesaMensal;
import br.extratomensal.api.domain.entities.Documento;
import br.extratomensal.api.domain.entities.GrupoDespesaMensal;
import br.extratomensal.api.domain.entities.HistoricoContrato;
import br.extratomensal.api.domain.entities.HistoricoContratoIndiceCorrecao;
import br.extratomensal.api.domain.entities.IndiceCorrecao;
import br.extratomensal.api.domain.entities.MotivoGlosa;
import br.extratomensal.api.domain.entities.Usuario;
import br.extratomensal.api.domain.persistence.ContratoIndiceCorrecaoRepository;
import br.extratomensal.api.domain.persistence.ContratoRepository;
import br.extratomensal.api.domain.persistence.DocumentoRepository;
import br.extratomensal.api.domain.persistence.GrupoDespesaMensalRepository;
import br.extratomensal.api.domain.persistence.HistoricoContratoIndiceCorrecaoRepository;
import br.extratomensal.api.domain.persistence.HistoricoContratoRepository;
import br.extratomensal.api.domain.persistence.IndiceCorrecaoRepository;
import br.extratomensal.api.exceptions.GeneralRuntimeException;
import br.extratomensal.api.services.ContratoService;
import br.extratomensal.api.services.DocumentosService;
import br.extratomensal.api.services.SecurityService;
import br.extratomensal.api.services.helpers.ServicesSecurityHelper;

@Service
public class ContratoServiceImpl implements ContratoService {	
	
	@Autowired
	private ContratoRepository contratos;
	
	@Autowired
	private GrupoDespesaMensalRepository grupos;
	
	@Autowired
	private HistoricoContratoRepository historicoContratoRep;
		
	@Autowired
	private IndiceCorrecaoRepository indices;
	
	@Autowired
	private HistoricoContratoIndiceCorrecaoRepository historicoIndicesRep;
	
	@Autowired
	private ContratoIndiceCorrecaoRepository contratoIndiceRep;	
	
	@Autowired
	private DocumentoRepository documentos;	
	
	@Autowired
	private SecurityService securityBeans;
	
	@Autowired
    private ServicesSecurityHelper seguranca;
	
	@Autowired
	private DocumentosService docService;
	
	@Override
	public ContratoDTO getContrato(Long id) {		
		
		Contrato contrato = contratos.find(id);
		this.seguranca.validarAcessoContrato(contrato);	
		
		ContratoDTO dtoRetorno =  ContratoDTO.fromContrato(contrato);
		
		Collection<ContratoIndiceCorrecao> indicesCorrecao = contrato.getIndices();
		List<String> listIndices = new ArrayList<String>();		
		
		for(ContratoIndiceCorrecao item : indicesCorrecao) {
			listIndices.add(item.getIndiceCorrecao().getNome());
			if(!StringUtils.isEmpty(item.getDescricaoOutro())) { // Somente um registro terá valor em descrição outro
				dtoRetorno.setIndiceOutro(item.getDescricaoOutro());
			}			
		}
		
		dtoRetorno.setIndiceCorrecao(listIndices);
		return dtoRetorno;		
	}

	@Override
	@Transactional
	public void criaContrato(ContratoDTO contrato, List<NovoDocumentoDTO> documentos) {	
		this.seguranca.usuarioExterno();
		Usuario user = securityBeans.getUser();
		
		Date dataInicio = null;
		Date dataTermino = null;
		
		if(contrato.getDataInicio() != null) {
			dataInicio = new Date(contrato.getDataInicio());
		}
		
		if(contrato.getDataTermino() != null) {
			dataTermino = new Date(contrato.getDataTermino());		
		}
		
		if(dataInicio != null && dataTermino != null && dataInicio.after(dataTermino)) {
			throw new GeneralRuntimeException("Data inicial deve ser anterior à data término.");
		}
		
		Contrato entity = new Contrato();
		
		entity.setGlosado('N');
		entity.setDataInicio(dataInicio);
		entity.setDataTermino(dataTermino);
		entity.setObservacao(contrato.getObservacao());
		entity.setValor(contrato.getValor());		
		entity.setUsuario(user);
		entity.setIdentificador(contrato.getIdentificador());
		entity.setContratante(contrato.getContratante());
		entity.setContratado(contrato.getContratado());
		entity.setVigencia(contrato.getVigencia());
		entity.setProrrogacaoAutomatica(contrato.getProrrogacaoAutomatica());
		DespesaMensal despesa = new DespesaMensal();
		despesa.setId(contrato.getDespesaMensal().getIdDespesaMensal());
		entity.setDespesaMensal(despesa);
		entity.setExcluido('N');
		entity.setIdServentia(contrato.getIdServentia());
		entity.setIndiceReajuste(contrato.getIndiceReajuste());
		entity.setCompetenciaCorrecao(contrato.getCompetenciaCorrecao());
		
		entity = contratos.save(entity);
		
		List<IndiceCorrecao> indicesCorrecao = indices
				.findAll()
				.stream()
				.filter(item -> contrato.getIndiceCorrecao().contains(item.getNome()))
				.collect(Collectors.toList());
		
		List<ContratoIndiceCorrecao> indicesContrato = new ArrayList<ContratoIndiceCorrecao>();
		for(IndiceCorrecao item : indicesCorrecao) {
			ContratoIndiceCorrecao contratoIndice = new ContratoIndiceCorrecao();
			contratoIndice.setContrato(entity);
			if(item.getNome() != null && item.getNome().equalsIgnoreCase("Outro")) {
				contratoIndice.setDescricaoOutro(contrato.getIndiceOutro()); // Somente um campo campo de HistoricoContratoIndiceCorrecao terá valor outro
			}
			contratoIndice.setIndiceCorrecao(item);	
			indicesContrato.add(contratoIndice);
		}
		contratoIndiceRep.saveAll(indicesContrato);
		
		Timestamp dateNow = new Timestamp(System.currentTimeMillis());
		
		HistoricoContrato historico =  new HistoricoContrato();
		historico.setGlosado('N');
		historico.setDataInicio(dataInicio);
		historico.setDataTermino(dataTermino);
		historico.setObservacao(entity.getObservacao());
		historico.setValor(entity.getValor());		
		historico.setUsuario(user);
		historico.setContratante(entity.getContratante());
		historico.setContratado(entity.getContratado());
		historico.setVigencia(entity.getVigencia());
		historico.setProrrogacaoAutomatica(entity.getProrrogacaoAutomatica());		
		historico.setExcluido('N');		
		historico.setIndiceReajuste(entity.getIndiceReajuste());
		historico.setCompetenciaCorrecao(entity.getCompetenciaCorrecao());		
		historico.setContrato(entity);
		historico.setData(dateNow);
		historico.setAcao('C');				
		
		List<HistoricoContratoIndiceCorrecao> historicosIndices = new ArrayList<HistoricoContratoIndiceCorrecao>();
		for(IndiceCorrecao item : indicesCorrecao) {
			HistoricoContratoIndiceCorrecao historicoIndice = new HistoricoContratoIndiceCorrecao();
			historicoIndice.setHistoricoContrato(historico);
			if(item.getNome() != null && item.getNome().equalsIgnoreCase("Outro")) {
				historicoIndice.setDescricaoOutro(contrato.getIndiceOutro()); // Somente um campo campo de HistoricoContratoIndiceCorrecao terá valor outro
			}
			historicoIndice.setIndiceCorrecao(item);			
			historicosIndices.add(historicoIndice);
		}
		
		historicoContratoRep.saveOrUpdate(historico);
		historicoIndicesRep.saveAll(historicosIndices);
		
		Set<Documento> setdoc = new HashSet<Documento>();
		
		documentos.stream().filter(documento -> NovoDocumentoDTO.ADICIONAR.equals(documento.getAcao()))
				.forEach(documento -> {
					DocumentoDTO dto = this.docService.uploadDocumento(documento.getIdTipoDocumento() , documento.getInfoArquivo(), documento.getDadosArquivo(), dateNow);
					Long idDocumento = dto.getIdDocumento();
					Documento doc = this.documentos.findPorID(idDocumento);
					
					setdoc.add(doc);
					
				});
		
		entity.setDocumentos(setdoc);
		contratos.save(entity);
	}
	
	@Override
	@Transactional
	public void editaContrato(Long id, ContratoDTO contrato, List<NovoDocumentoDTO> documentos) {		
		Contrato entity = contratos.find(id);	
		this.seguranca.validarAcessoContrato(entity);	
		
		/*  Se o contrato NÃO estiver vinculado a nenhuma despesa, pode editar SEMPRE. Não importa qual valor do atributo GLOSADO.
			Se o contrato ESTIVER vinculado a alguma despesa, SOMENTE pode editar se o atributo GLOSADO for "T" ou "N"		 
		*/
		if(!contrato.getIsAditivo() && !(entity.getExtratos().isEmpty() || entity.getGlosado() == 'T' || entity.getGlosado() == 'N')) {			
			throw new GeneralRuntimeException("Já existe despesa(s) vinculada(s) a esta autorização.");
		}
		
		Date dataInicio = null;
		Date dataTermino = null;
		
		if(contrato.getDataInicio() != null) {
			dataInicio = new Date(contrato.getDataInicio());
		}
		
		if(contrato.getDataTermino() != null) {
			dataTermino = new Date(contrato.getDataTermino());		
		}		 
		
		if(dataInicio != null && dataTermino != null && dataInicio.after(dataTermino)) {
			throw new GeneralRuntimeException("Data inicial deve ser anterior à data término.");
		}
		
		Usuario user = securityBeans.getUser();		
		
		entity.setGlosado('N');
		entity.setObservacaoAnalise(null);
		entity.setDataInicio(dataInicio);
		entity.setDataTermino(dataTermino);
		entity.setObservacao(contrato.getObservacao());
		entity.setValor(contrato.getValor());		
		entity.setObservacao(contrato.getObservacao());		
		entity.setUsuario(user);
		entity.setIdentificador(contrato.getIdentificador());
		entity.setContratante(contrato.getContratante());
		entity.setContratado(contrato.getContratado());
		entity.setVigencia(contrato.getVigencia());
		entity.setProrrogacaoAutomatica(contrato.getProrrogacaoAutomatica());
		entity.setExcluido('N');
		entity.setIdServentia(contrato.getIdServentia());
		entity.setIndiceReajuste(contrato.getIndiceReajuste());
		entity.setCompetenciaCorrecao(contrato.getCompetenciaCorrecao());		
		entity.setMotivoGlosa(null);
		List<IndiceCorrecao> listaIndicesAtual = this.indices.findAll().stream().filter(item -> item.getAtivo().equals("S")).collect(Collectors.toList());
		List<IndiceCorrecao> listaIndicesSave = listaIndicesAtual.stream().filter(item -> contrato.getIndiceCorrecao().contains(item.getNome())).collect(Collectors.toList());
		List<ContratoIndiceCorrecao> indicesContrato = new ArrayList<ContratoIndiceCorrecao>();

		for(IndiceCorrecao item : listaIndicesSave) {
			ContratoIndiceCorrecao indice = new ContratoIndiceCorrecao();
			indice.setContrato(entity);
			indice.setIndiceCorrecao(item);
			if(item.getNome() != null && item.getNome().equalsIgnoreCase("Outro")) {
				indice.setDescricaoOutro(contrato.getIndiceOutro()); // Somente um campo campo de HistoricoContratoIndiceCorrecao terá valor outro
			}
			indicesContrato.add(indice);
		}
		
		Timestamp dateNow = new Timestamp(System.currentTimeMillis());
		
		HistoricoContrato historico =  new HistoricoContrato();
		historico.setGlosado('N');
		historico.setDataInicio(dataInicio);
		historico.setDataTermino(dataTermino);
		historico.setObservacao(entity.getObservacao());
		historico.setValor(entity.getValor());		
		historico.setObservacao(entity.getObservacao());		
		historico.setUsuario(user);
		historico.setContratante(entity.getContratante());
		historico.setContratado(entity.getContratado());
		historico.setVigencia(entity.getVigencia());
		historico.setProrrogacaoAutomatica(entity.getProrrogacaoAutomatica());		
		historico.setExcluido('N');		
		historico.setIndiceReajuste(entity.getIndiceReajuste());
		historico.setCompetenciaCorrecao(entity.getCompetenciaCorrecao());		
		historico.setContrato(entity);
		historico.setData(dateNow);
		historico.setAcao(contrato.getIsAditivo() ? 'A' : 'U');		
		
		List<HistoricoContratoIndiceCorrecao> historicosIndices = new ArrayList<HistoricoContratoIndiceCorrecao>();
		for(IndiceCorrecao item : listaIndicesSave) {
			HistoricoContratoIndiceCorrecao historicoIndice = new HistoricoContratoIndiceCorrecao();
			historicoIndice.setHistoricoContrato(historico);
			if(item.getNome() != null && item.getNome().equalsIgnoreCase("Outro")) {
				historicoIndice.setDescricaoOutro(contrato.getIndiceOutro()); // Somente um campo campo de HistoricoContratoIndiceCorrecao terá valor outro
			}
			
			historicoIndice.setIndiceCorrecao(item);
			historicosIndices.add(historicoIndice);
		}

		Optional<NovoDocumentoDTO> opt = documentos.stream().filter(documento -> NovoDocumentoDTO.ADICIONAR.equals(documento.getAcao())).findFirst();
		if(opt.isPresent()) {
			DocumentoDTO dto = this.docService.uploadDocumento(opt.get().getIdTipoDocumento() , opt.get().getInfoArquivo(), opt.get().getDadosArquivo(), dateNow);
			Long idDocumento = dto.getIdDocumento();
			Documento doc = this.documentos.findPorID(idDocumento);
			entity.getDocumentos().add(doc);
		}		
		
		if(!contrato.getIsAditivo()) {
			List<NovoDocumentoDTO> docsExcluir = documentos.stream().filter(documento -> NovoDocumentoDTO.REMOVER.equals(documento.getAcao())).collect(Collectors.toList());			
			for(NovoDocumentoDTO item : docsExcluir) {
				Documento doc = this.documentos.findPorIDAndTipo(item.getIdTipoDocumento(), 'C');
				this.documentos.removeByContratoAutorizacao(doc.getId(), dateNow);
			}		
		}
		contratoIndiceRep.removeAll(entity, listaIndicesAtual);
		contratoIndiceRep.saveAll(indicesContrato);
		historicoContratoRep.saveOrUpdate(historico);
		historicoIndicesRep.saveAll(historicosIndices);		
		contratos.save(entity);
	}	
	
	@Override
	public List<IndiceCorrecaoDTO> listaIndicesCorrecao() {	
		return indices.findAll()
				.parallelStream()
				.map(IndiceCorrecaoDTO::fromIndiceCorrecao)
				.sorted((p1, p2) -> p1.getNome().compareToIgnoreCase(p2.getNome()))
				.collect(Collectors.toList());
		
	}
	
	@Override
	public List<MotivoGlosaDTO> getMotivosGlosa(Long idContrato) {
		List<Short> motivosContrato = this.contratos.find(idContrato).getMotivoGlosa().stream().map(MotivoGlosa::getIdMotivoGlosa).sorted()
				.collect(Collectors.toList());
		
		List<MotivoGlosaDTO> motivos = this.contratos.getMotivoGlosa().stream()				
				.sorted(Comparator.comparingLong(MotivoGlosa::getId)).map(MotivoGlosaDTO::fromEntity)
				.collect(Collectors.toList());
		
		for(MotivoGlosaDTO item : motivos) {
			item.setMarcado(motivosContrato.contains(item.getIdMotivoGlosa()));			
		}
		
		return motivos;		
		
	}


	@Override
	public List<GrupoDespesaMensal> grupoContratos(FiltroContratoDTO filtro) {
		this.seguranca.usuarioExterno();
		Usuario user = securityBeans.getUser();
		return grupos.getAgrupamentoContrato(filtro, user.getId().longValue());
	}

	@Override
	@Transactional
	public void delete(Long idContrato) {		
		Contrato contrato;
		try {
			contrato = contratos.find(idContrato);
			this.seguranca.validarAcessoContrato(contrato);
		} catch (Exception e) {
			throw new GeneralRuntimeException(e.getMessage());
		}
		
		if(!contrato.getExtratos().isEmpty()) {
			throw new GeneralRuntimeException("Já existe despesa(s) vinculada(s) a este contrato.");
		}
		
		Timestamp dateNow = new Timestamp(System.currentTimeMillis());
		Usuario user = securityBeans.getUser();				

		for(Documento item : contrato.getDocumentos()) {					
			item.setDataExclusao(dateNow);
			item.setExcluido('S');										
		}
		this.contratos.save(contrato);
		
		HistoricoContrato historico =  new HistoricoContrato();
		historico.setExcluido('S');
		historico.setGlosado('N');
		historico.setDataInicio(contrato.getDataInicio());
		historico.setDataTermino(contrato.getDataTermino());
		historico.setObservacao(contrato.getObservacao());
		historico.setValor(contrato.getValor());		
		historico.setObservacao(contrato.getObservacao());		
		historico.setUsuario(user);
		historico.setContratante(contrato.getContratante());
		historico.setContratado(contrato.getContratado());
		historico.setVigencia(contrato.getVigencia());
		historico.setProrrogacaoAutomatica(contrato.getProrrogacaoAutomatica());		
		historico.setIndiceReajuste(contrato.getIndiceReajuste());
		historico.setCompetenciaCorrecao(contrato.getCompetenciaCorrecao());		
		historico.setContrato(contrato);
		historico.setData(dateNow);
		historico.setAcao('E');				
		
		List<HistoricoContratoIndiceCorrecao> historicosIndices = new ArrayList<HistoricoContratoIndiceCorrecao>();
		for(ContratoIndiceCorrecao item : contrato.getIndices()) {			
			HistoricoContratoIndiceCorrecao historicoIndice = new HistoricoContratoIndiceCorrecao();
			historicoIndice.setHistoricoContrato(historico);
			historicoIndice.setIndiceCorrecao(item.getIndiceCorrecao());
			historicoIndice.setDescricaoOutro(item.getDescricaoOutro());			
			historicosIndices.add(historicoIndice);
		}
		
		
		historicoContratoRep.saveOrUpdate(historico);
		historicoIndicesRep.saveAll(historicosIndices);	
		this.contratos.excluir(idContrato);			
		
	}	
		
}
