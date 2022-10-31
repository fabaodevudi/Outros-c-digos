package br.jus.tjrs.extrajudicial.selo.extratomensal.impl.repositories;

import java.util.Collection;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;

import org.springframework.stereotype.Repository;

import br.jus.tjrs.arch.jpa.repository.BaseJpaRepository;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.Contrato;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.Documento;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.entities.MotivoGlosa;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.domain.persistence.ContratoRepository;
import br.jus.tjrs.extrajudicial.selo.extratomensal.api.exceptions.UnknownObjectIdException;

@Repository
public class ContratoRepositoryImpl extends BaseJpaRepository<Contrato, Long>  implements ContratoRepository {

	@PersistenceContext
	private EntityManager em;

	@Override
	protected EntityManager getEntityManager() {
		return em;
	}

	@Override
	protected Class<Contrato> getEntityClass() {
		return Contrato.class;
	}

	@Override
	public Contrato save(Contrato entity) {
		super.save(entity);
		return entity;
	}

	@Override
	public Contrato find(Long id) {
		return this.findById(id).orElseThrow(() -> new UnknownObjectIdException(getEntityClass(), id));
	}

	@Override
	public List<Contrato> getByServentia(Long idServentia) {
		CriteriaBuilder builder = this.getEntityManager().getCriteriaBuilder();
		
		CriteriaQuery<Contrato> query = builder.createQuery(getEntityClass());
		Root<Contrato> contrato = query.from(getEntityClass());
		query.where(builder.and(
				builder.equal(contrato.get("idServentia"), idServentia),
				builder.equal(contrato.get("excluido"), 'N')
				));		
		
		return this.getEntityManager().createQuery(query).getResultList();
	}

	@Override
	public void excluir(Long id) {
		CriteriaBuilder cb  = this.getEntityManager().getCriteriaBuilder();		
		CriteriaUpdate<Contrato> update = cb.createCriteriaUpdate(this.getEntityClass());
		Root<Contrato> root = update.from(this.getEntityClass());	
		
		update.set("excluido", 'S');		
		
		update.where(cb.equal(root.get("id"), id));

		this.getEntityManager().createQuery(update).executeUpdate();
		
	}	
	

	@Override
	public Collection<MotivoGlosa> getMotivoGlosa() {
		CriteriaBuilder builder = this.getEntityManager().getCriteriaBuilder();

		CriteriaQuery<MotivoGlosa> query = builder.createQuery(MotivoGlosa.class);
		Root<MotivoGlosa> motivos = query.from(MotivoGlosa.class);

		query
				.where(builder.and(builder.equal(motivos.get("tipo"), 'C')))
				.distinct(true);

		return this.getEntityManager().createQuery(query).getResultList();
	}
	
	@Override
	public Contrato getContratoByDocumento(Long idDocumento) {
		CriteriaBuilder builder = this.getEntityManager().getCriteriaBuilder();
		
		CriteriaQuery<Contrato> query = builder.createQuery(getEntityClass());
		Root<Contrato> contrato = query.from(getEntityClass());
		Join<Contrato, Documento> documento = (Join)contrato.fetch("documentos");
		query.where(builder.and(
				builder.equal(documento.get("excluido"), 'N'),
				builder.equal(contrato.get("excluido"), 'N'),
				builder.equal(documento.get("id"), idDocumento)				
				));	
		
		
		return this.getEntityManager().createQuery(query).getSingleResult();
		
	}
	
}
