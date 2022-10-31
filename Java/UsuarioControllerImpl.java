package br.extratomensal.application.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import br.extratomensal.api.controllers.UsuarioController;
import br.extratomensal.api.domain.dto.ServentiasUsuarioPerfilDTO;
import br.extratomensal.api.domain.dto.UsuarioDTO;
import br.extratomensal.api.domain.dto.UsuarioPerfisDTO;
import br.extratomensal.api.services.UsuarioService;

@Controller
public class UsuarioControllerImpl implements UsuarioController {

	@Autowired
	private UsuarioService usuarios;	

	@Override
	public void atualizarPerfisUsuario(Long idUsuario, UsuarioPerfisDTO usuarioPerfis) {
		this.usuarios.atualizarPerfis(idUsuario, usuarioPerfis.getPerfis());
	}	

	@Override
	public UsuarioPerfisDTO listarPefisByIdUsuario(Long idUsuario) {
		return usuarios.listarPefisByIdUsuario(idUsuario);
	}
	
	@Override
	public List<UsuarioDTO> listarUsuarios() {
		return usuarios.listarUsuariosServentias();
	}

	@Override
	public void atualizarServentiasUsuario(Long idUsuario, Long idPerfil, ServentiasUsuarioPerfilDTO serventiasUsuarioPerfilDTO) {
		usuarios.atualizarServentias(idUsuario, idPerfil, serventiasUsuarioPerfilDTO.getListaServentias());		
	}
	
	@Override
	public Long countServentiasUsuPerfil(Long idUsuario, Long idPerfil) {
		return usuarios.countServentiasUsuPerfil(idUsuario, idPerfil);
	}

	@Override
	public UsuarioDTO adicionarUsuario(UsuarioPerfisDTO usuarioPerfis) {
		return usuarios.criaUsuario(usuarioPerfis.getLogin());
		
	}	

}
