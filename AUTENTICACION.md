# Guía de Autenticación - Proyecto Final SSC

## 📋 Sistema de Autenticación

El proyecto incluye un sistema de autenticación completo con las siguientes características:

### 1. **Componentes Principales**

#### AuthContext (`src/context/AuthContext.tsx`)
- Gestiona el estado de autenticación global
- Proporciona funciones de login y logout
- Almacena el usuario en localStorage
- Verifica la sesión al cargar la aplicación



#### Login (`src/components/Login.tsx`)
- Pantalla de login similar a la de UCOL
- Campos para número de cuenta y contraseña
- Validaciones de entrada
- Mensajes de error claros
- Muestra credenciales de prueba disponibles

#### PrivateRoute (`src/components/PrivateRoute.tsx`)
- Protege las rutas que requieren autenticación
- Redirige a login si no hay usuario autenticado
- Muestra pantalla de carga mientras verifica la sesión

#### Navbar (`src/components/Navbar.tsx`)
- Barra de navegación para usuarios autenticados
- Muestra nombre del usuario y número de cuenta
- Botón de logout con confirmación

### 2. **Credenciales de Prueba**

Las siguientes credenciales están disponibles para probar:

| Número de Cuenta | Contraseña | Nombre | Rol |
|------------------|-----------|--------|-----|
| 20234276 | pass123 | Juan Pérez | student |
| 20234277 | pass456 | María García | student |
| 20234278 | admin123 | Carlos López | admin |
| 20234279 | pass789 | Ana Rodríguez | student |
| 20234280 | prof456 | Dr. Roberto Martínez | professor |

### 3. **Flujo de Autenticación**

1. **Usuario accede la aplicación** → Se verifica si hay sesión en localStorage
2. **Sin sesión** → Se muestra pantalla de login
3. **Usuario ingresa credenciales** → Se valida contra la base de datos de usuarios
4. **Credenciales correctas** → Usuario autenticado, se almacena en localStorage
5. **Usuario navega** → Accede a publicaciones con su información en barra superior
6. **Usuario logout** → Se elimina sesión y se redirige a login

### 4. **Almacenamiento de Datos**

- **localStorage**: Almacena el usuario autenticado en JSON
- **DEMO_ACCOUNTS**: Array de usuarios disponibles en `src/utils/demoAccounts.ts`
- **Datos validados**: El servidor realiza una pequeña pausa (500ms) para simular validación

### 5. **Seguridad**

⚠️ **Nota de Desarrollo**: Este es un sistema de prueba. En producción:
- Usar Backend API para validar credenciales
- Implementar JWT (JSON Web Tokens)
- Usar HTTPS
- Hashing de contraseñas con bcrypt
- Rate limiting en intentos de login
- Renovación periódica de tokens

### 6. **Archivos Relacionados**

```
src/
├── context/
│   └── AuthContext.tsx          # Contexto de autenticación
├── components/
│   ├── Login.tsx               # Pantalla de login
│   ├── Login.css               # Estilos del login
│   ├── PrivateRoute.tsx        # Protección de rutas
│   ├── Navbar.tsx              # Navbar con usuario
│   └── Navbar.css              # Estilos del navbar
└── utils/
    └── demoAccounts.ts         # Base de datos de usuarios
```

### 7. **Cómo Usar**

**Iniciar sesión:**
```
1. Ir a http://localhost:5173/
2. Ingresar número de cuenta y contraseña
3. Hacer clic en "Entrar"
```

**Cerrar sesión:**
```
1. Hacer clic en "Salir" en la esquina superior derecha
2. Confirmar el cierre de sesión
```

### 8. **Variables de Entorno Recomendadas** (Para producción)

```env
VITE_API_URL=https://api.ucol.mx
VITE_AUTH_ENDPOINT=/auth/login
VITE_SESSION_TIMEOUT=3600000
```

### 9. **Próximos Pasos**

- Integrar con API real de UCOL
- Agregar recuperación de contraseña
- Implementar autenticación de dos factores
- Agregar roles y permisos avanzados
- Implementar refresh de tokens
- Agregar logging de acciones
- Crear panel de administración

---

**Última actualización**: Febrero 2026
**Versión**: 1.0.0
