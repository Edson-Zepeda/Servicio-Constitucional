import { LANGUAGES, Publication } from '../types/Publication'
import './PublicationCard.css'

interface PublicationCardProps {
  publication: Publication
  isFavorite: boolean
  onOpen: (publication: Publication) => void
  onToggleFavorite: (publicationId: string) => void
}

const PublicationCard = ({
  publication,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: PublicationCardProps) => {
  const languageLabel =
    LANGUAGES.find((language) => language.value === publication.language)?.label ??
    publication.language

  return (
    <article className="publication-card">
      <div className="publication-card-media">
        <img src={publication.imageUrl} alt={publication.title} />
        {publication.featured && <span className="publication-featured">Destacada</span>}
      </div>

      <div className="publication-card-body">
        <div className="publication-card-tags">
          <span>{publication.format}</span>
          <span>{languageLabel}</span>
        </div>

        <h3>{publication.title}</h3>
        <p className="publication-authors">{publication.authors}</p>
        <p className="publication-description">{publication.description}</p>

        <dl className="publication-metadata">
          <div>
            <dt>Editorial</dt>
            <dd>{publication.publisher}</dd>
          </div>
          <div>
            <dt>Consultas</dt>
            <dd>{publication.views}</dd>
          </div>
          <div>
            <dt>Descargas</dt>
            <dd>{publication.downloads}</dd>
          </div>
        </dl>

        <div className="publication-card-actions">
          <button type="button" className="primary-button" onClick={() => onOpen(publication)}>
            Ver ficha
          </button>
          <button
            type="button"
            className={isFavorite ? 'favorite-button active' : 'favorite-button'}
            onClick={() => onToggleFavorite(publication.id)}
          >
            {isFavorite ? 'Quitar favorito' : 'Guardar'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default PublicationCard
