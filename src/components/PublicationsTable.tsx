import { AREAS, PUBLICATION_STATUS_OPTIONS, Publication } from '../types/Publication'
import './PublicationsTable.css'

interface PublicationsTableProps {
  publications: Publication[]
  onEdit: (id: string) => void
  onDelete: (id: string) => Promise<void>
}

const PublicationsTable = ({
  publications,
  onEdit,
  onDelete,
}: PublicationsTableProps) => {
  const getAreaLabel = (area: string) =>
    AREAS.find((item) => item.value === area)?.label ?? area

  const getStatusLabel = (status: string) =>
    PUBLICATION_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status

  return (
    <div className="publications-table-wrapper">
      <table className="publications-table">
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Area</th>
            <th>Estatus</th>
            <th>Destacada</th>
            <th>Metricas</th>
            <th>Actualizada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {publications.map((publication) => (
            <tr key={publication.id}>
              <td>
                <div className="table-title">
                  <strong>{publication.title}</strong>
                  <span>{publication.authors}</span>
                </div>
              </td>
              <td>{getAreaLabel(publication.area)}</td>
              <td>
                <span className={`table-badge publication-${publication.status}`}>
                  {getStatusLabel(publication.status)}
                </span>
              </td>
              <td>{publication.featured ? 'Si' : 'No'}</td>
              <td>
                {publication.views} vistas · {publication.downloads} descargas
              </td>
              <td>{publication.updatedAt.slice(0, 10)}</td>
              <td>
                <div className="table-actions">
                  <button type="button" className="ghost-button" onClick={() => onEdit(publication.id)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ghost-button danger"
                    onClick={() => void onDelete(publication.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PublicationsTable
