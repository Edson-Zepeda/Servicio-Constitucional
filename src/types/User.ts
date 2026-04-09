export type UserRole = 'admin' | 'normal'

export type UserStatus = 'active' | 'inactive'

export interface UserRecord {
  id: string
  accountNumber: string
  password: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  career: string
  phone: string
  bio: string
  favoritePublicationIds: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export type SessionUser = Omit<UserRecord, 'password'>

export type ActivityEntity = 'publication' | 'user' | 'session' | 'favorite'

export interface ActivityLog {
  id: string
  actorAccount: string
  actorName: string
  action: string
  entity: ActivityEntity
  entityId: string
  description: string
  createdAt: string
}

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'admin', label: 'Administrador' },
  { value: 'normal', label: 'Usuario normal' },
]

export const USER_STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

export const sanitizeUser = (user: UserRecord): SessionUser => {
  const sessionUser = { ...user } as Partial<UserRecord>
  delete sessionUser.password
  return sessionUser as SessionUser
}
