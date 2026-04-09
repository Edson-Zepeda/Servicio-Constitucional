import { useEffect, useState } from 'react'
import { Publication } from '../types/Publication'
import PublicationCard from './PublicationCard'
import './PublicationsList.css'

interface PublicationsListProps {
  publications: Publication[]
  favoriteIds: string[]
  onOpenPublication: (publication: Publication) => void
  onToggleFavorite: (publicationId: string) => void
}

const ITEMS_PER_PAGE = 6

const PublicationsList = ({
  publications,
  favoriteIds,
  onOpenPublication,
  onToggleFavorite,
}: PublicationsListProps) => {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [publications.length])

  const totalPages = Math.max(1, Math.ceil(publications.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const visibleItems = publications.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (publications.length === 0) {
    return (
      <section className="publications-list-empty">
        <h3>No hay resultados con los filtros actuales</h3>
        <p>Ajusta la busqueda o limpia los filtros para explorar el catalogo completo.</p>
      </section>
    )
  }

  return (
    <section className="publications-list">
      <div className="publications-grid">
        {visibleItems.map((publication) => (
          <PublicationCard
            key={publication.id}
            publication={publication}
            isFavorite={favoriteIds.includes(publication.id)}
            onOpen={onOpenPublication}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination-button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          >
            Anterior
          </button>

          <span className="pagination-state">
            Pagina {safeCurrentPage} de {totalPages}
          </span>

          <button
            type="button"
            className="pagination-button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  )
}

export default PublicationsList
