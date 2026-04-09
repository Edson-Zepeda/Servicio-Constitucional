import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DEMO_ACCOUNTS } from '../utils/demoAccounts'
import './Login.css'

const Login = () => {
  const { login } = useAuth()
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!accountNumber.trim() || !password.trim()) {
      setError('Ingresa numero de cuenta y contrasena.')
      return
    }

    setIsLoading(true)
    try {
      await login(accountNumber, password)
    } catch (authError) {
      const errorMessage =
        authError instanceof Error ? authError.message : 'No fue posible iniciar sesion.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <section className="login-panel">
        <div className="login-copy">
          <p className="login-kicker">SSC · Proyecto final</p>
          <h1>Acceso al portal de publicaciones</h1>
          <p>
            Inicia sesion para entrar al catalogo normal o a la consola de
            administracion, segun el rol de la cuenta.
          </p>

          <div className="login-demo-grid">
            {DEMO_ACCOUNTS.filter((account) => account.status === 'active').map((account) => (
              <article key={account.accountNumber}>
                <span>{account.role === 'admin' ? 'Admin' : 'Normal'}</span>
                <strong>{account.name}</strong>
                <small>{account.accountNumber}</small>
                <code>{account.password}</code>
              </article>
            ))}
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Numero de cuenta</span>
            <input
              type="text"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="20260001"
              disabled={isLoading}
            />
          </label>

          <label className="form-field">
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contrasena"
              disabled={isLoading}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="primary-button login-submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Login
