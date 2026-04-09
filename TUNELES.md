# Ver el proyecto con puertos de VS Code

Esta es la forma de dos puertos que usamos normalmente:

- `5173`: frontend React/Vite.
- `8000`: backend PHP.

## 1. Frontend

Abre una terminal en VS Code:

```powershell
cd "C:\Users\Lenovo\Downloads\Proyecto Final  SSC\Proyecto Final  SSC"
npm.cmd run dev
```

Abre en local:

```text
http://127.0.0.1:5173
```

En VS Code, ve a `Ports`, agrega el puerto `5173` y ponlo como `Public` si quieres compartirlo.

## 2. Backend PHP

Abre otra terminal en VS Code:

```powershell
cd "C:\Users\Lenovo\Downloads\Proyecto Final  SSC\Proyecto Final  SSC"
npm.cmd run backend
```

Abre en local:

```text
http://127.0.0.1:8000/pedidos.php
```

En VS Code, ve a `Ports`, agrega el puerto `8000` y ponlo como `Public` si quieres compartirlo.

## 3. Si PowerShell no deja usar npm

Usa `npm.cmd` en vez de `npm`:

```powershell
npm.cmd run dev
npm.cmd run backend
```

## 4. Si el puerto 8000 ya esta ocupado

Busca el proceso:

```powershell
netstat -ano | Select-String ':8000'
```

Detenlo con el PID que aparezca al final:

```powershell
Stop-Process -Id <PID> -Force
```

Luego vuelve a correr:

```powershell
npm.cmd run backend
```

## 5. Opcion de una sola URL

Si quieres verlo junto en un solo puerto, solo levanta el backend:

```powershell
npm.cmd run backend
```

Y abre:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/pedidos.php
```

Eso funciona porque `router.php` sirve el frontend compilado en `/` y el PHP en `/pedidos.php`.
