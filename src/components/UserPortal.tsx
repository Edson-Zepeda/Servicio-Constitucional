import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePublications } from '../hooks/usePublications'
import { apiDashboard, apiUsers } from '../services/api'
import { Publication } from '../types/Publication'
import Header from './Header'
import PublicationDetailsModal from './PublicationDetailsModal'
import PublicationsList from './PublicationsList'
import SearchBar, { CatalogFilters } from './SearchBar'
import './UserPortal.css'

const initialFilters: CatalogFilters = {
  query: '',
  author: '',
  area: '',
  language: '',
  format: '',
  isbn: '',
  sortBy: 'recent',
  featuredOnly: false,
}

const UserPortal = () => {
  const { user, refreshUser } = useAuth()
  const { publications, loading, error, recordView, recordDownload } = usePublications()
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const [activePanel, setActivePanel] = useState<'catalog' | 'favorites'>('catalog')
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof apiDashboard.getUserSummary>
  > | null>(null)
  const [favoriteActionLoading, setFavoriteActionLoading] = useState(false)

  const visiblePublications = publications.filter(
    (publication) => publication.status === 'published'
  )

  useEffect(() => {
    const loadSummary = async () => {
      if (!user) {
        return
      }

      const dashboardSummary = await apiDashboard.getUserSummary(user.accountNumber)
      setSummary(dashboardSummary)
    }

    void loadSummary()
  }, [user, publications])

  if (!user) {
    return null
  }

  const favoriteIds = user.favoritePublicationIds
  const featuredPublications = visiblePublications.filter((publication) => publication.featured)

  const applyFilters = (collection: Publication[]) => {
    const normalizedQuery = filters.query.trim().toLowerCase()
    const normalizedAuthor = filters.author.trim().toLowerCase()
    const normalizedIsbn = filters.isbn.trim().toLowerCase()

    const filtered = collection.filter((publication) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          publication.title,
          publication.description,
          publication.keywords ?? '',
          publication.publisher,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      const matchesAuthor =
        !normalizedAuthor || publication.authors.toLowerCase().includes(normalizedAuthor)
      const matchesArea = !filters.area || publication.area === filters.area
      const matchesLanguage = !filters.language || publication.language === filters.language
      const matchesFormat = !filters.format || publication.format === filters.format
      const matchesIsbn =
        !normalizedIsbn || (publication.isbn ?? '').toLowerCase().includes(normalizedIsbn)
      const matchesFeatured = !filters.featuredOnly || publication.featured

      return (
        matchesQuery &&
        matchesAuthor &&
        matchesArea &&
        matchesLanguage &&
        matchesFormat &&
        matchesIsbn &&
        matchesFeatured
      )
    })

    return filtered.sort((left, right) => {
      if (filters.sortBy === 'title') {
        return left.title.localeCompare(right.title)
      }

      if (filters.sortBy === 'downloads') {
        return right.downloads - left.downloads
      }

      if (filters.sortBy === 'views') {
        return right.views - left.views
      }

      return new Date(right.publicationDate).getTime() - new Date(left.publicationDate).getTime()
    })
  }

  const favoritePublications = visiblePublications.filter((publication) =>
    favoriteIds.includes(publication.id)
  )
  const filteredCatalog = applyFilters(visiblePublications)
  const filteredFavorites = applyFilters(favoritePublications)
  const currentCollection = activePanel === 'catalog' ? filteredCatalog : filteredFavorites

  const handleFilterChange = <K extends keyof CatalogFilters>(
    field: K,
    value: CatalogFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleToggleFavorite = async (publicationId: string) => {
    setFavoriteActionLoading(true)
    try {
      await apiUsers.toggleFavorite(user.accountNumber, publicationId)
      await refreshUser()
    } catch (actionError) {
      console.error('No fue posible actualizar favoritos:', actionError)
    } finally {
      setFavoriteActionLoading(false)
    }
  }

  const handleOpenPublication = async (publication: Publication) => {
    const updatedPublication = await recordView(publication.id)
    setSelectedPublication(updatedPublication ?? publication)
  }

  const handleDownload = async (publication: Publication) => {
    const updatedPublication = await recordDownload(publication.id)
    setSelectedPublication(updatedPublication ?? publication)
    window.open(publication.doi, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="user-portal">
      <Header
        userName={user.name}
        favoriteCount={favoriteIds.length}
        publicationCount={visiblePublications.length}
        featuredCount={featuredPublications.length}
      />

      <section className="user-portal-topbar">
        <div className="panel-switcher">
          <button
            type="button"
            className={activePanel === 'catalog' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActivePanel('catalog')}
          >
            Catalogo
          </button>
          <button
            type="button"
            className={activePanel === 'favorites' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActivePanel('favorites')}
          >
            Favoritos
          </button>
        </div>

        <div className="user-overview">
          <article>
            <strong>{summary?.areasCovered ?? 0}</strong>
            <span>areas activas</span>
          </article>
          <article>
            <strong>{summary?.favoriteDownloads ?? 0}</strong>
            <span>descargas en favoritos</span>
          </article>
        </div>
      </section>

      <SearchBar
        filters={filters}
        totalResults={currentCollection.length}
        totalCatalog={activePanel === 'catalog' ? visiblePublications.length : favoritePublications.length}
        onChange={handleFilterChange}
        onReset={() => setFilters(initialFilters)}
      />

      <section className="highlight-strip">
        {featuredPublications.slice(0, 3).map((publication) => (
          <button
            key={publication.id}
            type="button"
            className="highlight-card"
            onClick={() => void handleOpenPublication(publication)}
          >
            <span>Destacada</span>
            <strong>{publication.title}</strong>
            <small>{publication.authors}</small>
          </button>
        ))}
      </section>

      {loading ? (
        <section className="portal-state">
          <h3>Cargando catalogo...</h3>
        </section>
      ) : error ? (
        <section className="portal-state error">
          <h3>No fue posible cargar la informacion</h3>
          <p>{error}</p>
        </section>
      ) : (
        <PublicationsList
          publications={currentCollection}
          favoriteIds={favoriteIds}
          onOpenPublication={(publication) => void handleOpenPublication(publication)}
          onToggleFavorite={(publicationId) => void handleToggleFavorite(publicationId)}
        />
      )}

      {favoriteActionLoading && <p className="favorite-status">Actualizando favoritos...</p>}

      <PublicationDetailsModal
        publication={selectedPublication}
        isFavorite={selectedPublication ? favoriteIds.includes(selectedPublication.id) : false}
        onClose={() => setSelectedPublication(null)}
        onToggleFavorite={(publicationId) => void handleToggleFavorite(publicationId)}
        onDownload={(publication) => void handleDownload(publication)}
      />
    </div>
  )
}

export default UserPortal
