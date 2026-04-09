# Portal Editorial SSC

Aplicacion final para la gestion y consulta de publicaciones institucionales. El sistema incluye dos perfiles de acceso:

- `admin`: gestiona usuarios, publicaciones y actividad reciente.
- `normal`: consulta el catalogo, aplica filtros, revisa fichas y guarda favoritos.

La app esta construida con React, TypeScript y Vite. La persistencia actual es local en navegador mediante `localStorage`, por lo que sirve bien para demo, pruebas y entrega academica sin backend real.

## Credenciales demo

| Rol | Cuenta | Contrasena |
| --- | --- | --- |
| Administrador | `20260001` | `AdminSSC2026` |
| Usuario normal | `20260002` | `AlumnoSSC2026` |

## Stack

- React 18
- TypeScript
- Vite
- ESLint
- Prettier
- Playwright para las demos automatizadas

## Como ejecutar

Instala dependencias si hace falta:

```bash
npm install
```

Modo desarrollo:

```bash
npm run dev
```

Abre:

```text
http://127.0.0.1:5173
```

Build de produccion:

```bash
npm run build
```

Preview de produccion:

```bash
npm run preview
```

Servidor estatico del build:

```bash
npm run serve:dist
```

## Scripts utiles

- `npm run dev`: levanta Vite en desarrollo.
- `npm run build`: compila TypeScript y genera `dist/`.
- `npm run preview`: sirve el build con Vite Preview.
- `npm run serve:dist`: sirve `dist/` con un servidor estatico simple de Node.
- `npm run lint`: valida el codigo con ESLint.
- `npm run format`: formatea `src/` con Prettier.
- `npm run demo:record`: genera la demo automatizada base.
- `npm run demo:record:clicks`: genera la demo con los clics marcados en rojo.

## Estructura del repo

```text
docs/        documentacion del proyecto
public/      assets publicos
scripts/     utilidades de grabacion y servidor estatico
src/         aplicacion React
```

Dentro de `src/`:

- `components/`: interfaz para admin y usuario normal.
- `context/`: autenticacion y sesion.
- `hooks/`: acceso reutilizable a usuarios y publicaciones.
- `services/`: capa de datos local y operaciones del sistema.
- `types/`: tipos de dominio.
- `utils/`: cuentas demo y datos semilla.

## Documentacion

- [Autenticacion](docs/AUTENTICACION.md)
- [Puertos y acceso web](docs/TUNELES.md)

## Notas

- Los datos se guardan por navegador, no en un servidor compartido.
- `artifacts/`, `dist/`, logs y videos generados no se versionan.
- El repositorio ya no depende de PHP o XAMPP para ejecutar la app principal.
