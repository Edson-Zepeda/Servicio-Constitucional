import { Publication } from '../types/Publication'
import { ActivityLog, SessionUser, UserRecord, UserRole, sanitizeUser } from '../types/User'
import { SEED_ACTIVITY, SEED_PUBLICATIONS, SEED_USERS } from '../utils/seedData'

const API_DELAY = 180

const STORAGE_KEYS = {
  users: 'ssc.users',
  publications: 'ssc.publications',
  activity: 'ssc.activity',
  session: 'ssc.session.account',
} as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const readCollection = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return clone(fallback)
  }

  const rawValue = localStorage.getItem(key)
  if (!rawValue) {
    return clone(fallback)
  }

  try {
    return JSON.parse(rawValue) as T
  } catch (error) {
    console.error(`No se pudo leer ${key}:`, error)
    return clone(fallback)
  }
}

const writeCollection = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}

export const bootstrapAppData = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    writeCollection(STORAGE_KEYS.users, SEED_USERS)
  }

  if (!localStorage.getItem(STORAGE_KEYS.publications)) {
    writeCollection(STORAGE_KEYS.publications, SEED_PUBLICATIONS)
  }

  if (!localStorage.getItem(STORAGE_KEYS.activity)) {
    writeCollection(STORAGE_KEYS.activity, SEED_ACTIVITY)
  }
}

const getUsersStore = (): UserRecord[] => {
  bootstrapAppData()
  return readCollection(STORAGE_KEYS.users, SEED_USERS)
}

const saveUsersStore = (users: UserRecord[]) => {
  writeCollection(STORAGE_KEYS.users, users)
}

const getPublicationsStore = (): Publication[] => {
  bootstrapAppData()
  return readCollection(STORAGE_KEYS.publications, SEED_PUBLICATIONS)
}

const savePublicationsStore = (publications: Publication[]) => {
  writeCollection(STORAGE_KEYS.publications, publications)
}

const getActivityStore = (): ActivityLog[] => {
  bootstrapAppData()
  return readCollection(STORAGE_KEYS.activity, SEED_ACTIVITY)
}

const saveActivityStore = (activity: ActivityLog[]) => {
  writeCollection(STORAGE_KEYS.activity, activity)
}

const getSessionAccount = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(STORAGE_KEYS.session)
}

const saveSessionAccount = (accountNumber: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  if (accountNumber) {
    localStorage.setItem(STORAGE_KEYS.session, accountNumber)
    return
  }

  localStorage.removeItem(STORAGE_KEYS.session)
}

const compareDatesDesc = (left: string, right: string) =>
  new Date(right).getTime() - new Date(left).getTime()

const getActorName = (accountNumber: string) => {
  const actor = getUsersStore().find((user) => user.accountNumber === accountNumber)
  return actor?.name ?? 'Sistema'
}

const appendActivity = (
  actorAccount: string,
  action: string,
  entity: ActivityLog['entity'],
  entityId: string,
  description: string
) => {
  const activity = getActivityStore()
  const newEntry: ActivityLog = {
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    actorAccount,
    actorName: getActorName(actorAccount),
    action,
    entity,
    entityId,
    description,
    createdAt: new Date().toISOString(),
  }

  activity.unshift(newEntry)
  saveActivityStore(activity.slice(0, 100))
}

const ensureEditableUser = (
  users: UserRecord[],
  target: UserRecord,
  updates: Partial<UserRecord>,
  actorAccount?: string
) => {
  if (target.accountNumber === actorAccount && updates.status === 'inactive') {
    throw new Error('No puedes desactivar tu propia cuenta.')
  }

  if (target.accountNumber === actorAccount && updates.role === 'normal') {
    const activeAdmins = users.filter(
      (user) => user.role === 'admin' && user.status === 'active'
    )

    if (activeAdmins.length === 1) {
      throw new Error('Debe existir al menos un administrador activo.')
    }
  }

  if (
    target.role === 'admin' &&
    target.status === 'active' &&
    (updates.role === 'normal' || updates.status === 'inactive')
  ) {
    const remainingAdmins = users.filter(
      (user) =>
        user.accountNumber !== target.accountNumber &&
        user.role === 'admin' &&
        user.status === 'active'
    )

    if (remainingAdmins.length === 0) {
      throw new Error('No puedes quitar al ultimo administrador activo.')
    }
  }
}

export const apiAuth = {
  async restoreSession(): Promise<SessionUser | null> {
    await delay(API_DELAY)
    bootstrapAppData()

    const accountNumber = getSessionAccount()
    if (!accountNumber) {
      return null
    }

    const user = getUsersStore().find((item) => item.accountNumber === accountNumber)
    if (!user || user.status !== 'active') {
      saveSessionAccount(null)
      return null
    }

    return sanitizeUser(user)
  },

  async login(accountNumber: string, password: string): Promise<SessionUser> {
    await delay(API_DELAY)
    bootstrapAppData()

    const users = getUsersStore()
    const userIndex = users.findIndex(
      (item) =>
        item.accountNumber === accountNumber.trim() &&
        item.password === password &&
        item.status === 'active'
    )

    if (userIndex === -1) {
      throw new Error('Credenciales invalidas o cuenta inactiva.')
    }

    const now = new Date().toISOString()
    const updatedUser: UserRecord = {
      ...users[userIndex],
      lastLoginAt: now,
      updatedAt: now,
    }

    users[userIndex] = updatedUser
    saveUsersStore(users)
    saveSessionAccount(updatedUser.accountNumber)
    appendActivity(
      updatedUser.accountNumber,
      'inicio_sesion',
      'session',
      updatedUser.accountNumber,
      `${updatedUser.name} inicio sesion en el portal.`
    )

    return sanitizeUser(updatedUser)
  },

  async logout(): Promise<void> {
    await delay(API_DELAY)

    const accountNumber = getSessionAccount()
    if (accountNumber) {
      appendActivity(
        accountNumber,
        'cierre_sesion',
        'session',
        accountNumber,
        `${getActorName(accountNumber)} cerro sesion.`
      )
    }

    saveSessionAccount(null)
  },
}

export const apiUsers = {
  async getUsers(): Promise<SessionUser[]> {
    await delay(API_DELAY)

    return getUsersStore()
      .sort((left, right) => compareDatesDesc(left.updatedAt, right.updatedAt))
      .map((user) => sanitizeUser(user))
  },

  async getUserByAccount(accountNumber: string): Promise<SessionUser | null> {
    await delay(API_DELAY)

    const user = getUsersStore().find((item) => item.accountNumber === accountNumber)
    return user ? sanitizeUser(user) : null
  },

  async createUser(
    payload: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'favoritePublicationIds'>,
    actorAccount: string
  ): Promise<SessionUser> {
    await delay(API_DELAY)

    const users = getUsersStore()
    const normalizedAccount = payload.accountNumber.trim()
    const normalizedEmail = payload.email.trim().toLowerCase()

    if (users.some((user) => user.accountNumber === normalizedAccount)) {
      throw new Error('El numero de cuenta ya existe.')
    }

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('El correo ya esta registrado.')
    }

    const now = new Date().toISOString()
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      accountNumber: normalizedAccount,
      password: payload.password,
      name: payload.name.trim(),
      email: normalizedEmail,
      role: payload.role,
      status: payload.status,
      career: payload.career.trim(),
      phone: payload.phone.trim(),
      bio: payload.bio.trim(),
      favoritePublicationIds: [],
      createdAt: now,
      updatedAt: now,
    }

    users.unshift(newUser)
    saveUsersStore(users)
    appendActivity(
      actorAccount,
      'usuario_creado',
      'user',
      newUser.accountNumber,
      `Creo la cuenta ${newUser.accountNumber} para ${newUser.name}.`
    )

    return sanitizeUser(newUser)
  },

  async updateUser(
    accountNumber: string,
    updates: Partial<UserRecord>,
    actorAccount: string
  ): Promise<SessionUser> {
    await delay(API_DELAY)

    const users = getUsersStore()
    const userIndex = users.findIndex((user) => user.accountNumber === accountNumber)

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado.')
    }

    const targetUser = users[userIndex]
    ensureEditableUser(users, targetUser, updates, actorAccount)

    if (
      updates.email &&
      users.some(
        (user) =>
          user.accountNumber !== accountNumber &&
          user.email.toLowerCase() === updates.email?.trim().toLowerCase()
      )
    ) {
      throw new Error('El correo ya esta en uso por otro usuario.')
    }

    const updatedUser: UserRecord = {
      ...targetUser,
      ...updates,
      email: updates.email ? updates.email.trim().toLowerCase() : targetUser.email,
      name: updates.name ? updates.name.trim() : targetUser.name,
      career: updates.career ? updates.career.trim() : targetUser.career,
      phone: updates.phone ? updates.phone.trim() : targetUser.phone,
      bio: updates.bio ? updates.bio.trim() : targetUser.bio,
      updatedAt: new Date().toISOString(),
    }

    users[userIndex] = updatedUser
    saveUsersStore(users)

    appendActivity(
      actorAccount,
      'usuario_actualizado',
      'user',
      updatedUser.accountNumber,
      `Actualizo la cuenta ${updatedUser.accountNumber} (${updatedUser.name}).`
    )

    if (updatedUser.status !== 'active' && getSessionAccount() === updatedUser.accountNumber) {
      saveSessionAccount(null)
    }

    return sanitizeUser(updatedUser)
  },

  async updateUserRole(
    accountNumber: string,
    role: UserRole,
    actorAccount: string
  ): Promise<SessionUser> {
    return apiUsers.updateUser(accountNumber, { role }, actorAccount)
  },

  async toggleFavorite(
    accountNumber: string,
    publicationId: string
  ): Promise<SessionUser> {
    await delay(API_DELAY)

    const users = getUsersStore()
    const userIndex = users.findIndex((user) => user.accountNumber === accountNumber)

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado.')
    }

    const targetUser = users[userIndex]
    const isFavorite = targetUser.favoritePublicationIds.includes(publicationId)
    const nextFavorites = isFavorite
      ? targetUser.favoritePublicationIds.filter((id) => id !== publicationId)
      : [...targetUser.favoritePublicationIds, publicationId]

    const updatedUser: UserRecord = {
      ...targetUser,
      favoritePublicationIds: nextFavorites,
      updatedAt: new Date().toISOString(),
    }

    users[userIndex] = updatedUser
    saveUsersStore(users)

    const publication = getPublicationsStore().find((item) => item.id === publicationId)
    appendActivity(
      updatedUser.accountNumber,
      isFavorite ? 'favorito_removido' : 'favorito_agregado',
      'favorite',
      publicationId,
      `${updatedUser.name} ${
        isFavorite ? 'quito de favoritos' : 'agrego a favoritos'
      } "${publication?.title ?? 'la publicacion'}".`
    )

    return sanitizeUser(updatedUser)
  },
}

export const apiPublications = {
  async getAllPublications(): Promise<Publication[]> {
    await delay(API_DELAY)

    return getPublicationsStore().sort((left, right) =>
      compareDatesDesc(left.updatedAt, right.updatedAt)
    )
  },

  async getVisiblePublications(): Promise<Publication[]> {
    await delay(API_DELAY)

    return getPublicationsStore()
      .filter((publication) => publication.status === 'published')
      .sort((left, right) => compareDatesDesc(left.updatedAt, right.updatedAt))
  },

  async getPublicationById(id: string): Promise<Publication | undefined> {
    await delay(API_DELAY)

    return getPublicationsStore().find((publication) => publication.id === id)
  },

  async createPublication(
    publication: Partial<Publication>,
    actorAccount: string
  ): Promise<Publication> {
    await delay(API_DELAY)

    const publications = getPublicationsStore()
    const now = new Date().toISOString()
    const newPublication: Publication = {
      id: publication.id ?? `pub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: publication.title?.trim() ?? '',
      authors: publication.authors?.trim() ?? '',
      doi: publication.doi?.trim() ?? '',
      isbn: publication.isbn?.trim() ?? '',
      description: publication.description?.trim() ?? '',
      format: publication.format ?? 'Digital',
      area: publication.area ?? 'educacion',
      language: publication.language ?? 'es',
      imageUrl: publication.imageUrl?.trim() ?? '',
      publisher: publication.publisher?.trim() ?? 'Direccion General de Publicaciones',
      publicationDate: publication.publicationDate ?? now.split('T')[0],
      pages: publication.pages,
      keywords: publication.keywords?.trim() ?? '',
      status: publication.status ?? 'draft',
      featured: publication.featured ?? false,
      views: 0,
      downloads: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actorAccount,
    }

    publications.unshift(newPublication)
    savePublicationsStore(publications)
    appendActivity(
      actorAccount,
      'publicacion_creada',
      'publication',
      newPublication.id,
      `Creo la publicacion "${newPublication.title}".`
    )

    return newPublication
  },

  async updatePublication(
    id: string,
    updates: Partial<Publication>,
    actorAccount: string
  ): Promise<Publication> {
    await delay(API_DELAY)

    const publications = getPublicationsStore()
    const publicationIndex = publications.findIndex((publication) => publication.id === id)

    if (publicationIndex === -1) {
      throw new Error('Publicacion no encontrada.')
    }

    const target = publications[publicationIndex]
    const updatedPublication: Publication = {
      ...target,
      ...updates,
      title: updates.title ? updates.title.trim() : target.title,
      authors: updates.authors ? updates.authors.trim() : target.authors,
      doi: updates.doi ? updates.doi.trim() : target.doi,
      isbn: updates.isbn ? updates.isbn.trim() : target.isbn,
      description: updates.description ? updates.description.trim() : target.description,
      imageUrl: updates.imageUrl ? updates.imageUrl.trim() : target.imageUrl,
      publisher: updates.publisher ? updates.publisher.trim() : target.publisher,
      keywords: updates.keywords ? updates.keywords.trim() : target.keywords,
      updatedAt: new Date().toISOString(),
    }

    publications[publicationIndex] = updatedPublication
    savePublicationsStore(publications)
    appendActivity(
      actorAccount,
      'publicacion_actualizada',
      'publication',
      updatedPublication.id,
      `Actualizo la publicacion "${updatedPublication.title}".`
    )

    return updatedPublication
  },

  async deletePublication(id: string, actorAccount: string): Promise<void> {
    await delay(API_DELAY)

    const publications = getPublicationsStore()
    const publication = publications.find((item) => item.id === id)
    if (!publication) {
      throw new Error('Publicacion no encontrada.')
    }

    savePublicationsStore(publications.filter((item) => item.id !== id))

    const users = getUsersStore().map((user) => ({
      ...user,
      favoritePublicationIds: user.favoritePublicationIds.filter((favoriteId) => favoriteId !== id),
    }))
    saveUsersStore(users)

    appendActivity(
      actorAccount,
      'publicacion_eliminada',
      'publication',
      id,
      `Elimino la publicacion "${publication.title}".`
    )
  },

  async searchPublications(query: string): Promise<Publication[]> {
    await delay(API_DELAY)

    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return getPublicationsStore()
        .filter((publication) => publication.status === 'published')
        .sort((left, right) => compareDatesDesc(left.updatedAt, right.updatedAt))
    }

    return getPublicationsStore().filter((publication) => {
      if (publication.status !== 'published') {
        return false
      }

      return [
        publication.title,
        publication.authors,
        publication.description,
        publication.keywords ?? '',
        publication.publisher,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  },

  async recordView(id: string): Promise<Publication | undefined> {
    const publications = getPublicationsStore()
    const publicationIndex = publications.findIndex((publication) => publication.id === id)

    if (publicationIndex === -1) {
      return undefined
    }

    const updatedPublication: Publication = {
      ...publications[publicationIndex],
      views: publications[publicationIndex].views + 1,
      updatedAt: new Date().toISOString(),
    }

    publications[publicationIndex] = updatedPublication
    savePublicationsStore(publications)
    return updatedPublication
  },

  async recordDownload(id: string): Promise<Publication | undefined> {
    const publications = getPublicationsStore()
    const publicationIndex = publications.findIndex((publication) => publication.id === id)

    if (publicationIndex === -1) {
      return undefined
    }

    const updatedPublication: Publication = {
      ...publications[publicationIndex],
      downloads: publications[publicationIndex].downloads + 1,
      updatedAt: new Date().toISOString(),
    }

    publications[publicationIndex] = updatedPublication
    savePublicationsStore(publications)
    return updatedPublication
  },
}

export const apiActivity = {
  async getRecentActivity(limit = 20): Promise<ActivityLog[]> {
    await delay(API_DELAY)

    return getActivityStore()
      .sort((left, right) => compareDatesDesc(left.createdAt, right.createdAt))
      .slice(0, limit)
  },
}

export const apiDashboard = {
  async getAdminSummary() {
    await delay(API_DELAY)

    const users = getUsersStore()
    const publications = getPublicationsStore()

    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === 'active').length,
      admins: users.filter((user) => user.role === 'admin').length,
      normalUsers: users.filter((user) => user.role === 'normal').length,
      totalPublications: publications.length,
      publishedPublications: publications.filter((item) => item.status === 'published').length,
      drafts: publications.filter((item) => item.status === 'draft').length,
      archived: publications.filter((item) => item.status === 'archived').length,
      featured: publications.filter((item) => item.featured).length,
      downloads: publications.reduce((total, item) => total + item.downloads, 0),
      views: publications.reduce((total, item) => total + item.views, 0),
    }
  },

  async getUserSummary(accountNumber: string) {
    await delay(API_DELAY)

    const user = getUsersStore().find((item) => item.accountNumber === accountNumber)
    const publications = getPublicationsStore().filter((item) => item.status === 'published')

    if (!user) {
      return null
    }

    const favorites = publications.filter((item) =>
      user.favoritePublicationIds.includes(item.id)
    )

    return {
      totalVisiblePublications: publications.length,
      featuredPublications: publications.filter((item) => item.featured).length,
      favoriteCount: favorites.length,
      areasCovered: new Set(publications.map((item) => item.area)).size,
      favoriteDownloads: favorites.reduce((total, item) => total + item.downloads, 0),
    }
  },
}

export default {
  auth: apiAuth,
  users: apiUsers,
  publications: apiPublications,
  activity: apiActivity,
  dashboard: apiDashboard,
  bootstrap: bootstrapAppData,
}
