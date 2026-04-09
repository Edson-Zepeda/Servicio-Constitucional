/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiAuth, apiUsers, bootstrapAppData } from '../services/api'
import { SessionUser } from '../types/User'

interface AuthContextType {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (accountNumber: string, password: string) => Promise<SessionUser>
  logout: () => Promise<void>
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        bootstrapAppData()
        const sessionUser = await apiAuth.restoreSession()
        setUser(sessionUser)
      } catch (error) {
        console.error('Error al restaurar la sesion:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void restore()
  }, [])

  const login = async (accountNumber: string, password: string) => {
    const sessionUser = await apiAuth.login(accountNumber, password)
    setUser(sessionUser)
    return sessionUser
  }

  const logout = async () => {
    await apiAuth.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    if (!user) {
      return
    }

    const freshUser = await apiUsers.getUserByAccount(user.accountNumber)
    setUser(freshUser)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    loading,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
