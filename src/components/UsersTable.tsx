import { SessionUser } from '../types/User'
import './UsersTable.css'

interface UsersTableProps {
  users: SessionUser[]
  currentUserAccount: string
  onEdit: (accountNumber: string) => void
  onToggleStatus: (user: SessionUser) => void
  onToggleRole: (user: SessionUser) => void
}

const UsersTable = ({
  users,
  currentUserAccount,
  onEdit,
  onToggleStatus,
  onToggleRole,
}: UsersTableProps) => {
  return (
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estatus</th>
            <th>Carrera</th>
            <th>Favoritos</th>
            <th>Ultimo acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isCurrentUser = user.accountNumber === currentUserAccount

            return (
              <tr key={user.accountNumber}>
                <td>{user.accountNumber}</td>
                <td>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </td>
                <td>
                  <span className={`table-badge user-role-${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`table-badge user-status-${user.status}`}>{user.status}</span>
                </td>
                <td>{user.career}</td>
                <td>{user.favoritePublicationIds.length}</td>
                <td>{user.lastLoginAt ? user.lastLoginAt.slice(0, 10) : 'Sin acceso'}</td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="ghost-button" onClick={() => onEdit(user.accountNumber)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => onToggleRole(user)}
                      disabled={isCurrentUser}
                    >
                      {user.role === 'admin' ? 'Hacer normal' : 'Hacer admin'}
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => onToggleStatus(user)}
                      disabled={isCurrentUser}
                    >
                      {user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default UsersTable
