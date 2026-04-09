import { useCallback, useEffect, useState } from 'react'
import { apiUsers } from '../services/api'
import { SessionUser, UserRecord } from '../types/User'

type CreateUserPayload = Omit<
  UserRecord,
  'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'favoritePublicationIds'
>

export const useUsers = () => {
  const [users, setUsers] = useState<SessionUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiUsers.getUsers()
      setUsers(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'No fue posible cargar los usuarios.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const createUser = useCallback(async (payload: CreateUserPayload, actorAccount: string) => {
    const createdUser = await apiUsers.createUser(payload, actorAccount)
    setUsers((prev) => [createdUser, ...prev])
    return createdUser
  }, [])

  const updateUser = useCallback(
    async (accountNumber: string, updates: Partial<UserRecord>, actorAccount: string) => {
      const updatedUser = await apiUsers.updateUser(accountNumber, updates, actorAccount)
      setUsers((prev) =>
        prev.map((user) => (user.accountNumber === accountNumber ? updatedUser : user))
      )
      return updatedUser
    },
    []
  )

  const toggleFavorite = useCallback(async (accountNumber: string, publicationId: string) => {
    const updatedUser = await apiUsers.toggleFavorite(accountNumber, publicationId)
    setUsers((prev) =>
      prev.map((user) => (user.accountNumber === accountNumber ? updatedUser : user))
    )
    return updatedUser
  }, [])

  const getUser = useCallback(
    (accountNumber: string) => users.find((user) => user.accountNumber === accountNumber),
    [users]
  )

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    toggleFavorite,
    getUser,
    refreshUsers: loadUsers,
  }
}
