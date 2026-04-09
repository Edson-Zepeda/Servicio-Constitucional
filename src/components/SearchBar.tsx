import { AREAS, FORMATS, LANGUAGES } from '../types/Publication'
import './SearchBar.css'

export interface CatalogFilters {
  query: string
  author: string
  area: string
  language: string
  format: string
  isbn: string
  sortBy: 'recent' | 'title' | 'downloads' | 'views'
  featuredOnly: boolean
}

interface SearchBarProps {
  filters: CatalogFilters
  totalResults: number
  totalCatalog: number
  onChange: <K extends keyof CatalogFilters>(field: K, value: CatalogFilters[K]) => void
  onReset: () => void
}

const SearchBar = ({
  filters,
  totalResults,
  totalCatalog,
  onChange,
  onReset,
}: SearchBarProps) => {
  return (
    <section className="search-bar">
      <div className="search-header">
        <div>
          <p className="search-eyebrow">Exploracion avanzada</p>
          <h2>Busca por titulo, autor, area o formato</h2>
        </div>
        <div className="search-meta">
          <strong>{totalResults}</strong>
          <span>resultados de {totalCatalog}</span>
        </div>
      </div>

      <div className="search-grid">
        <label className="search-field">
          <span>Titulo o palabra clave</span>
          <input
            type="text"
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Ej. gobierno, laboratorio, lectura"
          />
        </label>

        <label className="search-field">
          <span>Autor</span>
          <input
            type="text"
            value={filters.author}
            onChange={(event) => onChange('author', event.target.value)}
            placeholder="Nombre del autor"
          />
        </label>

        <label className="search-field">
          <span>ISBN</span>
          <input
            type="text"
            value={filters.isbn}
            onChange={(event) => onChange('isbn', event.target.value)}
            placeholder="978..."
          />
        </label>

        <label className="search-field">
          <span>Area</span>
          <select
            value={filters.area}
            onChange={(event) => onChange('area', event.target.value)}
          >
            <option value="">Todas</option>
            {AREAS.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span>Idioma</span>
          <select
            value={filters.language}
            onChange={(event) => onChange('language', event.target.value)}
          >
            <option value="">Todos</option>
            {LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span>Formato</span>
          <select
            value={filters.format}
            onChange={(event) => onChange('format', event.target.value)}
          >
            <option value="">Todos</option>
            {FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span>Orden</span>
          <select
            value={filters.sortBy}
            onChange={(event) =>
              onChange('sortBy', event.target.value as CatalogFilters['sortBy'])
            }
          >
            <option value="recent">Mas recientes</option>
            <option value="title">Titulo A-Z</option>
            <option value="downloads">Mas descargados</option>
            <option value="views">Mas vistos</option>
          </select>
        </label>

        <label className="search-field search-field-checkbox">
          <span>Destacadas</span>
          <button
            type="button"
            className={filters.featuredOnly ? 'toggle active' : 'toggle'}
            onClick={() => onChange('featuredOnly', !filters.featuredOnly)}
          >
            {filters.featuredOnly ? 'Solo destacadas' : 'Todas'}
          </button>
        </label>
      </div>

      <div className="search-actions">
        <button type="button" className="secondary-button" onClick={onReset}>
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}

export default SearchBar
