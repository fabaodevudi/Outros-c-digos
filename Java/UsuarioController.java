package br.jus.tjrs.extrajudicial.selo.extratomensal.api.controllers;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.ServentiasUsuarioPerfilDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.UsuarioDTO;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.dto.UsuarioPerfisDTO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@Api
@RestController
@RequestMapping(path = "/rest/usuarios", produces = MediaType.APPLICATION_JSON_VALUE)
public interface UsuarioController {	
	
	@ApiOperation(value = "perfis")
	@PutMapping(path = "/{id}/perfis", consumes = MediaType.APPLICATION_JSON_VALUE)
	void atualizarPerfisUsuario(@PathVariable("id") Long idUsuario, @RequestBody UsuarioPerfisDTO usuarioPerfis);	

	@ApiOperation(value = "criaUsuario")
	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	UsuarioDTO adicionarUsuario(@RequestBody UsuarioPerfisDTO usuarioPerfis);	
	
	@ApiOperation("listarPerfisUsuario")
	@GetMapping("/{id}/perfis")
	UsuarioPerfisDTO listarPefisByIdUsuario(@PathVariable("id") Long idUsuario);

	@ApiOperation("listarUsuarios")
	@GetMapping
	List<UsuarioDTO> listarUsuarios();
	
	@ApiOperation(value = "atualizarServentiasUsuario")
	@PutMapping(path = "/{id}/perfil/{perfil}/serventias", consumes = MediaType.APPLICATION_JSON_VALUE)
	void atualizarServentiasUsuario(@PathVariable("id") Long idUsuario, @PathVariable("perfil") Long idPerfil, @RequestBody ServentiasUsuarioPerfilDTO serventiasUsuarioPerfilDTO);

	@ApiOperation("countServentiasUsuPerfil")
	@GetMapping("/{id}/perfil/{perfil}/contagem/serventias")
	Long countServentiasUsuPerfil(@PathVariable("id") Long idUsuario, @PathVariable("perfil") Long idPerfil);
	
}
