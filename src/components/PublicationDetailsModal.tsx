import {
  AREAS,
  LANGUAGES,
  PUBLICATION_STATUS_OPTIONS,
  Publication,
} from '../types/Publication'
import './PublicationDetailsModal.css'

interface PublicationDetailsModalProps {
  publication: Publication | null
  isFavorite: boolean
  onClose: () => void
  onToggleFavorite: (publicationId: string) => void
  onDownload: (publication: Publication) => void
}

const PublicationDetailsModal = ({
  publication,
  isFavorite,
  onClose,
  onToggleFavorite,
  onDownload,
}: PublicationDetailsModalProps) => {
  if (!publication) {
    return null
  }

  const areaLabel =
    AREAS.find((area) => area.value === publication.area)?.label ?? publication.area
  const languageLabel =
    LANGUAGES.find((language) => language.value === publication.language)?.label ??
    publication.language
  const statusLabel =
    PUBLICATION_STATUS_OPTIONS.find((status) => status.value === publication.status)?.label ??
    publication.status

  return (
    <div className="publication-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="publication-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publication-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          Cerrar
        </button>

        <div className="modal-layout">
          <div className="modal-media">
            <img src={publication.imageUrl} alt={publication.title} />
          </div>

          <div className="modal-content">
            <p className="modal-kicker">{publication.publisher}</p>
            <h2 id="publication-modal-title">{publication.title}</h2>
            <p className="modal-authors">{publication.authors}</p>
            <p className="modal-description">{publication.description}</p>

            <div className="modal-badges">
              <span>{areaLabel}</span>
              <span>{publication.format}</span>
              <span>{languageLabel}</span>
              <span>{statusLabel}</span>
            </div>

            <dl className="modal-metadata">
              <div>
                <dt>DOI</dt>
                <dd>{publication.doi}</dd>
              </div>
              <div>
                <dt>ISBN</dt>
                <dd>{publication.isbn || 'Sin ISBN'}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>{publication.publicationDate}</dd>
              </div>
              <div>
                <dt>Paginas</dt>
                <dd>{publication.pages ?? 'Sin dato'}</dd>
              </div>
              <div>
                <dt>Palabras clave</dt>
                <dd>{publication.keywords || 'Sin palabras clave'}</dd>
              </div>
              <div>
                <dt>Metricas</dt>
                <dd>
                  {publication.views} vistas · {publication.downloads} descargas
                </dd>
              </div>
            </dl>

            <div className="modal-actions">
              <button type="button" className="primary-button" onClick={() => onDownload(publication)}>
                Abrir DOI
              </button>
              <button
                type="button"
                className={isFavorite ? 'favorite-button active' : 'favorite-button'}
                onClick={() => onToggleFavorite(publication.id)}
              >
                {isFavorite ? 'Quitar favorito' : 'Guardar favorito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicationDetailsModal
