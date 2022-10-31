package br.jus.tjrs.extrajudicial.selo.extratomensal.impl.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.ejb.Stateless;
import javax.transaction.Transactional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.PerfilPortalExtrajudDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.ServentiaFiltroUsuarioDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.ServentiaPermissoesDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.UserInfoDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.UsuarioDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.UsuarioPerfisDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.PerfilPortalExtrajud;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.Pessoa;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.ServentiaUsuarioPerfil;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.Usuario;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.UsuarioPerfil;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.persistence.PessoaRepository;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.persistence.ServentiaUsuarioPerfilRepository;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.persistence.UsuarioPerfilRepository;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.persistence.UsuarioRepository;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.exceptions.GeneralRuntimeException;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.exceptions.InconsistenciaUsuarioException;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.services.SecurityService;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.services.UsuarioService;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.services.helpers.ServicesSecurityHelper;
import br.jus.tjrs.security.model.DefaultUserInfo;

@Service
@Stateless
public class UsuarioServiceImp implements UsuarioService {

	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private UsuarioPerfilRepository usuarioPerfilRepository;
	
	@Autowired
	private PessoaRepository pessoaRepository;
	
	@Autowired
	private ServentiaUsuarioPerfilRepository serventiaUsuarioRepository;

	@Autowired
	private SecurityService security;
	
	@Autowired
	private ServicesSecurityHelper seguranca;
	
	private static ModelMapper modelMapper = new ModelMapper();

	@Override
	public Usuario getUsuarioByLogin(String login) {
		return usuarioRepository.getUsuarioByLogin(login);
	}		
	
	
	@Override
	public List<UsuarioDTO> listarUsuariosServentias() {
		try {
			seguranca.admin();
		} catch (InconsistenciaUsuarioException ex) {
			throw new GeneralRuntimeException("Somente o Administrador pode conceder ou remover acessos.");
		}
		
		List<DefaultUserInfo> listaUsersByGroups = security.usersByGroups("APP_PORTALEXTRAJUDICIAL_USERINTERNO");		

		List<UsuarioDTO> listaUsuario = listaUsersByGroups
				.stream()
				.map(user -> {
					user.setLogin(user.getLogin().toLowerCase());
					return modelMapper.map(user, UsuarioDTO.class);
				})
				
				.sorted((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()))
				.collect(Collectors.toList());		
		
		List<String> listaLogin = listaUsuario.stream().map(item -> { 
			return "'".concat(item.getLogin().toLowerCase()).concat("'");			
			}).collect(Collectors.toList());
		
		List<Object[]> lista = serventiaUsuarioRepository.getDescAndPermissaoInterinoByLogin(listaLogin);
		
		for(UsuarioDTO dto : listaUsuario) {
			List<String> listaPerfil = lista.stream().filter(
					item -> {
						return dto.getLogin().toLowerCase().equalsIgnoreCase((String)item[0]);
					})
					.map(item -> {
						return (String)item[1];
					})
					.distinct()
					.collect(Collectors.toList());
			if(listaPerfil.isEmpty()) {
				listaPerfil.add("Sem Perfil");
			}
			dto.setPerfis(listaPerfil);
			
			List<ServentiaFiltroUsuarioDTO> listaServentiaFiltroUsuarioDTO = lista.stream().filter(
					item -> {
						return dto.getLogin().toLowerCase().equalsIgnoreCase((String)item[0]);
					})
					.map(item -> {
						ServentiaFiltroUsuarioDTO serventiaDTO = new ServentiaFiltroUsuarioDTO();
						serventiaDTO.setRazaoSocial(item[2] != null ? (String)item[2] : null);
						serventiaDTO.setPermissaoT(item[3] != null ? (String)item[3] : null);
						serventiaDTO.setPermissaoI(item[4] != null ? (String)item[4] : null);
						return serventiaDTO;
					})
					.distinct()
					.collect(Collectors.toList());
			dto.setServentias(listaServentiaFiltroUsuarioDTO);
		}		
		
		return listaUsuario;
	}		
	
	@Override
	@Transactional
	public void atualizarPerfis(Long idUsuario, List<PerfilPortalExtrajudDTO> perfis) {		
		try {
			seguranca.admin();
		} catch (InconsistenciaUsuarioException ex) {
			throw new GeneralRuntimeException("Somente o Administrador pode conceder ou remover acessos.");
		}
				
		Usuario user = usuarioRepository.getUser(idUsuario);
						
		List<UsuarioPerfil> usuarioPerfis = user.getUsuarioPerfil();
		
		List<Long> listaIdPerfilAtual = usuarioPerfis.stream().map(UsuarioPerfil::getIdPerfil).collect(Collectors.toList());
		List<Long> listaIdPerfilRequest = perfis.stream().map(PerfilPortalExtrajudDTO::getIdPerfilPortalExtrajud).collect(Collectors.toList());
		
		List<Long> listaIdPerfilRemover = listaIdPerfilAtual.stream().filter(item -> !listaIdPerfilRequest.contains(item)).collect(Collectors.toList());		
		List<Long> listaIdPerfilAdicionar = listaIdPerfilRequest.stream().filter(item -> !listaIdPerfilAtual.contains(item)).collect(Collectors.toList());			
		
		List<UsuarioPerfil> listaUsuarioPerfilDelete = usuarioPerfis.stream().filter(p -> listaIdPerfilRemover.contains(p.getIdPerfil())).collect(Collectors.toList());		
		
		if(!listaUsuarioPerfilDelete.isEmpty()) {
			serventiaUsuarioRepository.deleteAllByUsuarioPerfil(listaUsuarioPerfilDelete);
			usuarioPerfilRepository.deleteAll(listaUsuarioPerfilDelete);
		}
		
		for(Long item : listaIdPerfilAdicionar) {
			UsuarioPerfil usuPerfil = new UsuarioPerfil(user.getId(), item);
			usuarioPerfilRepository.salvar(usuPerfil);
		}	
	}
	
	@Override	
	public UsuarioPerfisDTO listarPefisByIdUsuario(Long idUsuario) {		
		try {
			seguranca.admin();
		} catch (InconsistenciaUsuarioException ex) {
			throw new GeneralRuntimeException("Somente o Administrador pode conceder ou remover acessos.");
		}		
		
		Usuario usuario = usuarioRepository.getUser(idUsuario);		
		
		if(usuario.getPerfis() == null) {
			usuario.setPerfis(new ArrayList<PerfilPortalExtrajud>());
		}
		
		List<PerfilPortalExtrajudDTO> listaPerfil = usuario.getPerfis()
				.stream()
				.map(perfil -> modelMapper.map(perfil, PerfilPortalExtrajudDTO.class))
				.map(recursoDTO -> {recursoDTO.setMarcado(true); return recursoDTO;})
				.sorted(Comparator.comparing(PerfilPortalExtrajudDTO::getIdPerfilPortalExtrajud))
				.collect(Collectors.toList());
		
		UsuarioPerfisDTO usuarioPerfis = new UsuarioPerfisDTO();
		usuarioPerfis.setPerfis(listaPerfil);
		usuarioPerfis.setIdUsuario(usuario.getId());
		return usuarioPerfis;
	}
	
	@Override
	@Transactional
	public void atualizarServentias(Long idUsuario, Long idPerfil, List<ServentiaPermissoesDTO> serventias) {		
		try {
			seguranca.admin();
		} catch (InconsistenciaUsuarioException ex) {
			throw new GeneralRuntimeException("Somente o Administrador pode conceder ou remover acessos.");
		}

		UsuarioPerfil usuarioPerfil;

		try {
			usuarioPerfil = usuarioPerfilRepository.getByLoginAndIdPerfil(idUsuario, idPerfil);	
		} catch (Exception e) {
			throw new GeneralRuntimeException("Usuário ou perfil inválido");
		}			

		List<ServentiaPermissoesDTO> listaDTOAtual = serventiaUsuarioRepository.getServentiasByLoginAndPerfil(idUsuario, idPerfil);		
		List<ServentiaPermissoesDTO> listaDTORequest = serventias.stream().filter(item -> !listaDTOAtual.contains(item)).collect(Collectors.toList());
		
		List<Long> listaIdServentiaAtual = listaDTOAtual.stream().map(item -> item.getIdServentia().longValue()).collect(Collectors.toList());
		List<Long> listaIdServentiaRequest = serventias.stream().map(item -> item.getIdServentia().longValue()).collect(Collectors.toList());		
		List<Long> remover = listaIdServentiaAtual.stream().filter(item -> !listaIdServentiaRequest.contains(item)).collect(Collectors.toList());	
							
		
		if(!remover.isEmpty()) {
			serventiaUsuarioRepository.deleteAll(usuarioPerfil, remover);
		}		
		
		for(ServentiaPermissoesDTO item : listaDTORequest) {
			ServentiaUsuarioPerfil entity;

			Optional<Long> id = serventiaUsuarioRepository.getIdByUsuarioPerfilAndIdServentia(usuarioPerfil, item.getIdServentia());

			entity = id.isPresent() ? new ServentiaUsuarioPerfil(id.get()) : new ServentiaUsuarioPerfil();			

			entity.setIdServentia(item.getIdServentia());
			entity.setIdUsuPerfPortalExtrajud(usuarioPerfil.getIdUsuPerfPortalExtrajud());				
			entity.setPermissaoPCTitular(item.getTitularAnalise() && item.getTitularVisualizacao() ? "E" : !item.getTitularAnalise() && !item.getTitularVisualizacao() ? null : "L");
			entity.setPermissaoPCInterino(item.getInterinoAnalise() && item.getInterinoVisualizacao() ? "E" : !item.getInterinoAnalise() && !item.getInterinoVisualizacao() ? null : "L");
			
			serventiaUsuarioRepository.salvar(entity);
		}			
	}

	@Override
	public Long countServentiasUsuPerfil(Long idUsuario, Long idPerfil) {
		return serventiaUsuarioRepository.countServentiasUsuPerfil(idUsuario, idPerfil);
	}


	@Override
	@Transactional
	public UsuarioDTO criaUsuario(String login) {
		try {
			seguranca.admin();
		} catch (InconsistenciaUsuarioException ex) {
			throw new GeneralRuntimeException("Somente o Administrador pode conceder ou remover acessos.");
		}

		Pessoa pessoa;
		try {
			pessoa = pessoaRepository.getId(login);
		} catch (Exception e) {
			throw new GeneralRuntimeException("Não foi localizado um usuário ativo no Sistema Corporativo para o login selecionado. Favor contatar a DITIC.");
		}

		Long idUsuarioSeguro;
		
		try {
			idUsuarioSeguro = pessoaRepository.verificaSegurUsuarios(pessoa.getCodPessoa());
		} catch (Exception e) {
			// Para qualquer erro dispara Exception, pois o fluxo não pode seguir de qualquer forma.
			throw new GeneralRuntimeException("Não foi localizado um usuário no Sistema Segur para o login selecionado. Favor contatar a DITIC.");
		}			

		Usuario usuario = usuarioRepository.getUsuarioByLogin(login);

		if(usuario == null) {
			Usuario novoUsuario = new Usuario();
			novoUsuario.setIdUsuario(idUsuarioSeguro);
			novoUsuario.setPessoaByCodPessoa(pessoa);
			novoUsuario.setDataUltAlter(new Timestamp(System.currentTimeMillis()));
			final UserInfoDTO usuarioLogado = security.getUserInfo();
			novoUsuario.setID_USER_ULT_ALTER(usuarioLogado.getIdUsuario());			
			usuario = usuarioRepository.save(novoUsuario);			
		}
		
		UsuarioDTO usuarioDTO = new UsuarioDTO();
		usuarioDTO.setIdUsuario(usuario.getId());
		
		return usuarioDTO;
	}
	
	
}
