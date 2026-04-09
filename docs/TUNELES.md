# Puertos, VS Code y acceso web

## Opcion recomendada: un solo puerto

La aplicacion final ya no necesita backend separado. Para verla completa solo hace falta el frontend:

```powershell
cd "C:\Users\Lenovo\Downloads\Proyecto Final  SSC\Proyecto Final  SSC"
npm.cmd run dev
```

Abre localmente:

```text
http://127.0.0.1:5173
```

## Compartirla con VS Code Ports

1. Abre la pestaña `Ports`.
2. Agrega el puerto `5173`.
3. Cambia la visibilidad a `Public` si quieres compartirlo.
4. Usa la URL publica que genere VS Code.

Ese enlace es suficiente para mostrar todo el sistema:

- login
- experiencia de usuario normal
- experiencia de administrador
- CRUD de publicaciones
- CRUD de usuarios
- bitacora

## Ver el build final

Si prefieres mostrar la version compilada:

```powershell
npm.cmd run build
npm.cmd run serve:dist
```

Abre:

```text
http://127.0.0.1:4173
```

Tambien puedes publicar el puerto `4173` desde VS Code.

## Nota importante

No hace falta abrir un segundo puerto ni correr PHP para la app principal. El proyecto final funciona como frontend con persistencia local en navegador.
