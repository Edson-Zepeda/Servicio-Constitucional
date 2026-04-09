# Autenticacion y roles

## Resumen

El proyecto maneja autenticacion local con persistencia de sesion en `localStorage`. No existe backend real para login; la validacion ocurre en la capa `src/services/api.ts`.

## Roles disponibles

- `admin`: acceso al dashboard administrativo, CRUD de publicaciones, CRUD de usuarios y bitacora.
- `normal`: acceso al catalogo publico autenticado, filtros, detalle de publicaciones y favoritos.

## Credenciales demo activas

| Rol | Cuenta | Contrasena |
| --- | --- | --- |
| Administrador | `20260001` | `AdminSSC2026` |
| Usuario normal | `20260002` | `AlumnoSSC2026` |

## Flujo tecnico

1. `AuthProvider` intenta restaurar la sesion guardada.
2. Si no hay sesion valida, `PrivateRoute` muestra la pantalla de login.
3. `apiAuth.login()` valida cuenta, contrasena y estado del usuario.
4. La cuenta se guarda en `ssc.session.account`.
5. La app decide la experiencia segun `user.role`.

## Archivos clave

- `src/context/AuthContext.tsx`: estado global de autenticacion.
- `src/components/PrivateRoute.tsx`: control de acceso.
- `src/components/Login.tsx`: formulario de entrada.
- `src/services/api.ts`: login, logout, usuarios, publicaciones y actividad.
- `src/utils/seedData.ts`: usuarios y publicaciones iniciales.

## Limitaciones actuales

- La persistencia es local al navegador.
- No hay tokens, sesiones de servidor ni cifrado real.
- El sistema sirve para demo funcional y entrega academica, no para produccion.

## Si luego quieres llevarlo a backend real

- Mover autenticacion a API con base de datos.
- Hashear contrasenas.
- Manejar sesiones o JWT.
- Sustituir `localStorage` por llamadas HTTP reales.
