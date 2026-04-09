import { useEffect, useState } from 'react'
import { SessionUser, USER_ROLE_OPTIONS, USER_STATUS_OPTIONS, UserRole, UserStatus } from '../types/User'
import './UserForm.css'

export interface UserFormValues {
  accountNumber: string
  password: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  career: string
  phone: string
  bio: string
}

interface UserFormProps {
  user?: SessionUser | null
  onSave: (values: UserFormValues) => Promise<void>
  onCancel: () => void
}

const createEmptyUser = (): UserFormValues => ({
  accountNumber: '',
  password: '',
  name: '',
  email: '',
  role: 'normal',
  status: 'active',
  career: '',
  phone: '',
  bio: '',
})

const UserForm = ({ user, onSave, onCancel }: UserFormProps) => {
  const [formValues, setFormValues] = useState<UserFormValues>(createEmptyUser())
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      setFormValues(createEmptyUser())
      setErrors([])
      return
    }

    setFormValues({
      accountNumber: user.accountNumber,
      password: '',
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      career: user.career,
      phone: user.phone,
      bio: user.bio,
    })
    setErrors([])
  }, [user])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const validationErrors: string[] = []
    if (!formValues.accountNumber.trim()) {
      validationErrors.push('El numero de cuenta es requerido.')
    }
    if (!user && !formValues.password.trim()) {
      validationErrors.push('La contrasena es requerida para usuarios nuevos.')
    }
    if (!formValues.name.trim()) {
      validationErrors.push('El nombre es requerido.')
    }
    if (!formValues.email.trim()) {
      validationErrors.push('El correo es requerido.')
    }
    if (!formValues.career.trim()) {
      validationErrors.push('La carrera o area es requerida.')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      setErrors([])
      await onSave(formValues)
    } catch (saveError) {
      const errorMessage =
        saveError instanceof Error ? saveError.message : 'No se pudo guardar el usuario.'
      setErrors([errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="user-form-panel">
      <div className="form-panel-header">
        <div>
          <p className="form-panel-kicker">Gestion de cuentas</p>
          <h2>{user ? 'Editar usuario' : 'Nuevo usuario'}</h2>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      <form className="user-form" onSubmit={handleSubmit}>
        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <div className="form-grid">
          <label className="form-field">
            <span>Numero de cuenta</span>
            <input
              type="text"
              name="accountNumber"
              value={formValues.accountNumber}
              onChange={handleChange}
              disabled={Boolean(user)}
            />
          </label>

          <label className="form-field">
            <span>{user ? 'Nueva contrasena (opcional)' : 'Contrasena'}</span>
            <input
              type="text"
              name="password"
              value={formValues.password}
              onChange={handleChange}
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Nombre completo</span>
            <input type="text" name="name" value={formValues.name} onChange={handleChange} />
          </label>

          <label className="form-field form-field-wide">
            <span>Correo</span>
            <input type="email" name="email" value={formValues.email} onChange={handleChange} />
          </label>

          <label className="form-field">
            <span>Rol</span>
            <select name="role" value={formValues.role} onChange={handleChange}>
              {USER_ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Estatus</span>
            <select name="status" value={formValues.status} onChange={handleChange}>
              {USER_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Carrera o area</span>
            <input
              type="text"
              name="career"
              value={formValues.career}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Telefono</span>
            <input type="text" name="phone" value={formValues.phone} onChange={handleChange} />
          </label>

          <label className="form-field form-field-wide">
            <span>Bio</span>
            <textarea name="bio" rows={4} value={formValues.bio} onChange={handleChange} />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Volver
          </button>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar usuario'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default UserForm
