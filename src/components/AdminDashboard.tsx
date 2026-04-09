import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePublications } from '../hooks/usePublications'
import { useUsers } from '../hooks/useUsers'
import { apiActivity, apiDashboard } from '../services/api'
import { AREAS, PUBLICATION_STATUS_OPTIONS, Publication } from '../types/Publication'
import { SessionUser } from '../types/User'
import PublicationForm from './PublicationForm'
import PublicationsTable from './PublicationsTable'
import UserForm, { UserFormValues } from './UserForm'
import UsersTable from './UsersTable'
import './AdminDashboard.css'

type AdminTab = 'overview' | 'publications' | 'users' | 'activity'

const AdminDashboard = () => {
  const { user, refreshUser } = useAuth()
  const {
    publications,
    loading: publicationsLoading,
    error: publicationsError,
    addPublication,
    updatePublication,
    deletePublication,
  } = usePublications()
  const {
    users,
    loading: usersLoading,
    error: usersError,
    createUser,
    updateUser,
    getUser,
  } = useUsers()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof apiDashboard.getAdminSummary>
  > | null>(null)
  const [activity, setActivity] = useState<Awaited<
    ReturnType<typeof apiActivity.getRecentActivity>
  >>([])
  const [editingPublicationId, setEditingPublicationId] = useState<string | null>(null)
  const [editingUserAccount, setEditingUserAccount] = useState<string | null>(null)
  const [publicationSearch, setPublicationSearch] = useState('')
  const [publicationAreaFilter, setPublicationAreaFilter] = useState('')
  const [publicationStatusFilter, setPublicationStatusFilter] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('')

  useEffect(() => {
    const loadAdminMetadata = async () => {
      const [dashboardSummary, recentActivity] = await Promise.all([
        apiDashboard.getAdminSummary(),
        apiActivity.getRecentActivity(20),
      ])

      setSummary(dashboardSummary)
      setActivity(recentActivity)
    }

    void loadAdminMetadata()
  }, [publications, users])

  if (!user) {
    return null
  }

  const selectedPublication = editingPublicationId
    ? publications.find((publication) => publication.id === editingPublicationId) ?? null
    : null

  const selectedUser = editingUserAccount ? getUser(editingUserAccount) ?? null : null
  const isCreatingPublication = editingPublicationId === 'new'
  const isEditingPublication =
    Boolean(editingPublicationId) && editingPublicationId !== 'new'
  const isCreatingUser = editingUserAccount === 'new'
  const isEditingUser = Boolean(editingUserAccount) && editingUserAccount !== 'new'

  const filteredPublications = publications.filter((publication) => {
    const normalizedSearch = publicationSearch.trim().toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      publication.title.toLowerCase().includes(normalizedSearch) ||
      publication.authors.toLowerCase().includes(normalizedSearch)
    const matchesArea = !publicationAreaFilter || publication.area === publicationAreaFilter
    const matchesStatus =
      !publicationStatusFilter || publication.status === publicationStatusFilter

    return matchesSearch && matchesArea && matchesStatus
  })

  const filteredUsers = users.filter((candidate) => {
    const normalizedSearch = userSearch.trim().toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.accountNumber.includes(normalizedSearch) ||
      candidate.email.toLowerCase().includes(normalizedSearch)
    const matchesRole = !userRoleFilter || candidate.role === userRoleFilter
    const matchesStatus = !userStatusFilter || candidate.status === userStatusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const topPublications = [...publications]
    .sort((left, right) => right.downloads - left.downloads)
    .slice(0, 4)

  const handleSavePublication = async (payload: Partial<Publication>) => {
    if (isEditingPublication && editingPublicationId) {
      await updatePublication(editingPublicationId, payload, user.accountNumber)
    } else {
      await addPublication(payload, user.accountNumber)
    }

    setEditingPublicationId(null)
    setActiveTab('publications')
  }

  const handleDeletePublication = async (id: string) => {
    const confirmed = window.confirm('Esta accion eliminara la publicacion seleccionada. Continuar?')
    if (!confirmed) {
      return
    }

    await deletePublication(id, user.accountNumber)
  }

  const handleSaveUser = async (values: UserFormValues) => {
    if (isEditingUser && editingUserAccount) {
      const updates = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        career: values.career,
        phone: values.phone,
        bio: values.bio,
        ...(values.password ? { password: values.password } : {}),
      }

      await updateUser(editingUserAccount, updates, user.accountNumber)
      if (editingUserAccount === user.accountNumber) {
        await refreshUser()
      }
    } else {
      await createUser(values, user.accountNumber)
    }

    setEditingUserAccount(null)
    setActiveTab('users')
  }

  const handleToggleStatus = async (targetUser: SessionUser) => {
    const nextStatus = targetUser.status === 'active' ? 'inactive' : 'active'
    await updateUser(
      targetUser.accountNumber,
      { status: nextStatus },
      user.accountNumber
    )

    if (targetUser.accountNumber === user.accountNumber) {
      await refreshUser()
    }
  }

  const handleToggleRole = async (targetUser: SessionUser) => {
    const nextRole = targetUser.role === 'admin' ? 'normal' : 'admin'
    await updateUser(targetUser.accountNumber, { role: nextRole }, user.accountNumber)

    if (targetUser.accountNumber === user.accountNumber) {
      await refreshUser()
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-hero">
        <div>
          <p className="admin-kicker">Consola administrativa</p>
          <h1>Gobierno del portal editorial</h1>
          <p>
            Controla catalogo, cuentas y actividad desde un solo panel con permisos
            de administrador.
          </p>
        </div>
        <div className="admin-hero-meta">
          <article>
            <strong>{summary?.publishedPublications ?? 0}</strong>
            <span>publicadas</span>
          </article>
          <article>
            <strong>{summary?.totalUsers ?? 0}</strong>
            <span>usuarios</span>
          </article>
          <article>
            <strong>{summary?.downloads ?? 0}</strong>
            <span>descargas</span>
          </article>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          type="button"
          className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('overview')}
        >
          Resumen
        </button>
        <button
          type="button"
          className={activeTab === 'publications' ? 'tab-button active' : 'tab-button'}
          onClick={() => {
            setEditingPublicationId(null)
            setActiveTab('publications')
          }}
        >
          Publicaciones
        </button>
        <button
          type="button"
          className={activeTab === 'users' ? 'tab-button active' : 'tab-button'}
          onClick={() => {
            setEditingUserAccount(null)
            setActiveTab('users')
          }}
        >
          Usuarios
        </button>
        <button
          type="button"
          className={activeTab === 'activity' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('activity')}
        >
          Actividad
        </button>
      </nav>

      {(publicationsError || usersError) && (
        <section className="admin-alert">
          <p>{publicationsError || usersError}</p>
        </section>
      )}

      {activeTab === 'overview' && (
        <section className="admin-overview">
          <div className="admin-stat-grid">
            <article className="stat-card">
              <span>Usuarios activos</span>
              <strong>{summary?.activeUsers ?? 0}</strong>
              <small>
                {summary?.admins ?? 0} admins / {summary?.normalUsers ?? 0} normales
              </small>
            </article>
            <article className="stat-card">
              <span>Catalogo total</span>
              <strong>{summary?.totalPublications ?? 0}</strong>
              <small>
                {summary?.drafts ?? 0} borradores y {summary?.archived ?? 0} archivadas
              </small>
            </article>
            <article className="stat-card">
              <span>Publicaciones destacadas</span>
              <strong>{summary?.featured ?? 0}</strong>
              <small>{summary?.views ?? 0} vistas acumuladas</small>
            </article>
          </div>

          <div className="admin-columns">
            <section className="panel-card">
              <div className="panel-card-header">
                <h2>Mas descargadas</h2>
                <span>{topPublications.length} registros</span>
              </div>
              <div className="ranking-list">
                {topPublications.map((publication) => (
                  <article key={publication.id}>
                    <strong>{publication.title}</strong>
                    <span>{publication.downloads} descargas</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-card-header">
                <h2>Actividad reciente</h2>
                <span>{activity.length} eventos</span>
              </div>
              <div className="activity-list">
                {activity.slice(0, 6).map((event) => (
                  <article key={event.id}>
                    <strong>{event.actorName}</strong>
                    <p>{event.description}</p>
                    <span>{event.createdAt.slice(0, 16).replace('T', ' ')}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      )}

      {activeTab === 'publications' && (
        <section className="admin-section">
          {isCreatingPublication || isEditingPublication ? (
            <PublicationForm
              publication={isEditingPublication ? selectedPublication : null}
              ownerAccount={user.accountNumber}
              onSave={handleSavePublication}
              onCancel={() => setEditingPublicationId(null)}
            />
          ) : (
            <>
              <div className="section-toolbar">
                <div className="toolbar-filters">
                  <input
                    type="text"
                    value={publicationSearch}
                    onChange={(event) => setPublicationSearch(event.target.value)}
                    placeholder="Buscar titulo o autor"
                  />
                  <select
                    value={publicationAreaFilter}
                    onChange={(event) => setPublicationAreaFilter(event.target.value)}
                  >
                    <option value="">Todas las areas</option>
                    {AREAS.map((area) => (
                      <option key={area.value} value={area.value}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={publicationStatusFilter}
                    onChange={(event) => setPublicationStatusFilter(event.target.value)}
                  >
                    <option value="">Todos los estatus</option>
                    {PUBLICATION_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setEditingPublicationId('new')}
                >
                  Nueva publicacion
                </button>
              </div>

              {publicationsLoading ? (
                <section className="panel-card">
                  <p>Cargando publicaciones...</p>
                </section>
              ) : (
                <PublicationsTable
                  publications={filteredPublications}
                  onEdit={(id) => setEditingPublicationId(id)}
                  onDelete={handleDeletePublication}
                />
              )}
            </>
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <section className="admin-section">
          {isCreatingUser || isEditingUser ? (
            <UserForm
              user={isEditingUser ? selectedUser : null}
              onSave={handleSaveUser}
              onCancel={() => setEditingUserAccount(null)}
            />
          ) : (
            <>
              <div className="section-toolbar">
                <div className="toolbar-filters">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Buscar cuenta, nombre o correo"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(event) => setUserRoleFilter(event.target.value)}
                  >
                    <option value="">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="normal">Normal</option>
                  </select>
                  <select
                    value={userStatusFilter}
                    onChange={(event) => setUserStatusFilter(event.target.value)}
                  >
                    <option value="">Todos los estatus</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setEditingUserAccount('new')}
                >
                  Nuevo usuario
                </button>
              </div>

              {usersLoading ? (
                <section className="panel-card">
                  <p>Cargando usuarios...</p>
                </section>
              ) : (
                <UsersTable
                  users={filteredUsers}
                  currentUserAccount={user.accountNumber}
                  onEdit={(accountNumber) => setEditingUserAccount(accountNumber)}
                  onToggleRole={(targetUser) => void handleToggleRole(targetUser)}
                  onToggleStatus={(targetUser) => void handleToggleStatus(targetUser)}
                />
              )}
            </>
          )}
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="panel-card">
          <div className="panel-card-header">
            <h2>Bitacora del sistema</h2>
            <span>{activity.length} movimientos</span>
          </div>
          <div className="activity-list full">
            {activity.map((event) => (
              <article key={event.id}>
                <strong>{event.actorName}</strong>
                <p>{event.description}</p>
                <span>
                  {event.entity} · {event.createdAt.slice(0, 16).replace('T', ' ')}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminDashboard
