import { useEffect, useState } from 'react'
import {
  AREAS,
  FORMATS,
  LANGUAGES,
  PUBLICATION_STATUS_OPTIONS,
  Publication,
  createEmptyPublication,
  validatePublication,
} from '../types/Publication'
import './PublicationForm.css'

interface PublicationFormProps {
  publication?: Publication | null
  ownerAccount: string
  onSave: (publication: Partial<Publication>) => Promise<void>
  onCancel: () => void
}

const PublicationForm = ({
  publication,
  ownerAccount,
  onSave,
  onCancel,
}: PublicationFormProps) => {
  const [formData, setFormData] = useState<Partial<Publication>>(
    publication ?? createEmptyPublication(ownerAccount)
  )
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData(publication ?? createEmptyPublication(ownerAccount))
    setErrors([])
  }, [ownerAccount, publication])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target
    const nextValue =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : type === 'number'
          ? (value ? Number(value) : undefined)
          : value

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const validation = validatePublication(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      setIsSubmitting(false)
      return
    }

    try {
      setErrors([])
      await onSave(formData)
    } catch (saveError) {
      const errorMessage =
        saveError instanceof Error ? saveError.message : 'No se pudo guardar la publicacion.'
      setErrors([errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="publication-form-panel">
      <div className="form-panel-header">
        <div>
          <p className="form-panel-kicker">Edicion editorial</p>
          <h2>{publication ? 'Editar publicacion' : 'Nueva publicacion'}</h2>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      <form className="publication-form" onSubmit={handleSubmit}>
        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <div className="form-grid">
          <label className="form-field form-field-wide">
            <span>Titulo</span>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Nombre de la publicacion"
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Autores</span>
            <input
              type="text"
              name="authors"
              value={formData.authors || ''}
              onChange={handleChange}
              placeholder="Autor 1, Autor 2"
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Descripcion</span>
            <textarea
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Resumen ejecutivo de la publicacion"
            />
          </label>

          <label className="form-field">
            <span>DOI</span>
            <input
              type="text"
              name="doi"
              value={formData.doi || ''}
              onChange={handleChange}
              placeholder="https://doi.org/..."
            />
          </label>

          <label className="form-field">
            <span>ISBN</span>
            <input
              type="text"
              name="isbn"
              value={formData.isbn || ''}
              onChange={handleChange}
              placeholder="978..."
            />
          </label>

          <label className="form-field">
            <span>Editorial</span>
            <input
              type="text"
              name="publisher"
              value={formData.publisher || ''}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Fecha</span>
            <input
              type="date"
              name="publicationDate"
              value={formData.publicationDate || ''}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Paginas</span>
            <input
              type="number"
              name="pages"
              min="1"
              value={formData.pages ?? ''}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Area</span>
            <select name="area" value={formData.area || 'educacion'} onChange={handleChange}>
              {AREAS.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Idioma</span>
            <select name="language" value={formData.language || 'es'} onChange={handleChange}>
              {LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Formato</span>
            <select name="format" value={formData.format || 'Digital'} onChange={handleChange}>
              {FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Estatus</span>
            <select
              name="status"
              value={formData.status || 'draft'}
              onChange={handleChange}
            >
              {PUBLICATION_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field form-field-wide">
            <span>Palabras clave</span>
            <input
              type="text"
              name="keywords"
              value={formData.keywords || ''}
              onChange={handleChange}
              placeholder="educacion, sistema, universidad"
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Portada</span>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl || ''}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <label className="form-field form-field-inline">
            <span>Marcar como destacada</span>
            <input
              type="checkbox"
              name="featured"
              checked={Boolean(formData.featured)}
              onChange={handleChange}
            />
          </label>
        </div>

        {formData.imageUrl && (
          <div className="form-image-preview">
            <img src={formData.imageUrl} alt="Vista previa de portada" />
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Volver
          </button>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default PublicationForm
