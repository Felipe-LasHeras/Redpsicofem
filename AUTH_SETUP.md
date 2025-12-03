# 🔐 Sistema de Autenticación con Google - RedPsicoFem

Documentación completa para configurar y usar el sistema de autenticación con Google OAuth usando Supabase.

## 📋 Índice

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Configuración Inicial](#configuración-inicial)
3. [Ejecutar Migraciones](#ejecutar-migraciones)
4. [Flujos de Usuario](#flujos-de-usuario)
5. [Gestión de Usuarios](#gestión-de-usuarios)
6. [Pruebas](#pruebas)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen del Sistema

### Arquitectura
- **Frontend**: React con Context API para gestión de estado de autenticación
- **Backend**: Supabase Auth + PostgreSQL con Row Level Security (RLS)
- **OAuth Provider**: Google OAuth 2.0

### Roles del Sistema
1. **Admin**: Acceso completo al sistema, puede aprobar usuarios y gestionar todo
2. **Terapeuta Red Derivación**: Puede editar solo sus horarios y datos
3. **Terapeuta RedPsicoFem**: Puede editar solo sus horarios y datos

### Estados de Usuario
- **pending**: Usuario nuevo esperando aprobación
- **approved**: Usuario aprobado que puede acceder según su rol
- **rejected**: Usuario rechazado (no puede acceder)

---

## ⚙️ Configuración Inicial

### 1. Verificar Variables de Entorno

Asegúrate de tener en `frontend/.env`:

```env
REACT_APP_SUPABASE_URL=https://wshmktlkrydppmwsmvcp.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_aqui
REACT_APP_API_URL=https://wshmktlkrydppmwsmvcp.supabase.co/rest/v1
```

### 2. Verificar Configuración de Google OAuth

Ya está configurado en:
- **Google Cloud Console**: Proyecto `redpsicofem`
- **Redirect URI**: `https://wshmktlkrydppmwsmvcp.supabase.co/auth/v1/callback`
- **Orígenes autorizados**: `http://localhost:3000` y `https://redpsicofem-2c340.web.app`

### 3. Verificar Configuración en Supabase Dashboard

Ya está configurado en:
- **Authentication → Providers → Google**: ✅ Habilitado
- **Site URL**: `https://redpsicofem-2c340.web.app`
- **Redirect URLs**: Configuradas correctamente

---

## 🚀 Ejecutar Migraciones

### Opción 1: Usando Supabase CLI (Recomendado)

```bash
# Si no tienes Supabase CLI instalado
npm install -g supabase

# Linkear tu proyecto
supabase link --project-ref wshmktlkrydppmwsmvcp

# Ejecutar la migración
supabase db push
```

### Opción 2: Usando SQL Editor en Supabase Dashboard

1. Ve a https://app.supabase.com/project/wshmktlkrydppmwsmvcp
2. Navega a **SQL Editor** en el menú izquierdo
3. Crea una nueva query
4. Copia y pega el contenido completo de `supabase/migrations/20231203000000_create_user_profiles.sql`
5. Haz clic en **Run** para ejecutar

### Opción 3: Ejecutar SQL Directamente

```bash
# Usando psql (si tienes acceso directo a la DB)
psql "postgresql://postgres:[PASSWORD]@db.wshmktlkrydppmwsmvcp.supabase.co:5432/postgres" < supabase/migrations/20231203000000_create_user_profiles.sql
```

### Verificar que la Migración se Ejecutó Correctamente

Ejecuta esta query en SQL Editor:

```sql
-- Verificar que la tabla existe
SELECT * FROM public.user_profiles LIMIT 1;

-- Verificar que los triggers existen
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Verificar que las políticas RLS existen
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'user_profiles';
```

---

## 👥 Flujos de Usuario

### Flujo 1: Admin (felipe.las.heras@gmail.com) hace login por primera vez

```
1. Usuario accede a http://localhost:3000/login
2. Click en "Continuar con Google"
3. Google redirige de vuelta → /auth/callback
4. Sistema detecta que es admin por email
5. Crea perfil automáticamente con:
   - status: 'approved'
   - role: 'admin'
6. Redirige a /admin/dashboard
7. ✅ Admin tiene acceso completo
```

### Flujo 2: Usuario Nuevo (terapeuta) hace login

```
1. Usuario accede a http://localhost:3000/login
2. Click en "Continuar con Google"
3. Google redirige de vuelta → /auth/callback
4. Sistema crea perfil con:
   - status: 'pending'
   - role: null
5. Redirige a /pending-approval
6. ⏳ Usuario ve mensaje de espera
7. Admin debe aprobar desde /admin/usuarios
```

### Flujo 3: Admin Aprueba Usuario

```
1. Admin accede a /admin/usuarios
2. Ve lista de usuarios con status='pending'
3. Click en "Aprobar" para un usuario
4. Modal aparece para:
   - Seleccionar rol (terapeuta_red_derivacion o terapeuta_redpsicofem)
   - Asociar con un terapeuta existente en psicologos
5. Admin confirma
6. Sistema actualiza:
   - user_profiles: status='approved', role=seleccionado, terapeuta_id=X
   - psicologos: auth_user_id=usuario_id
7. ✅ Usuario puede acceder en su próximo login
```

### Flujo 4: Terapeuta Aprobado hace login

```
1. Usuario accede a /login
2. Login con Google
3. Sistema detecta:
   - status: 'approved'
   - role: 'terapeuta_red_derivacion' o 'terapeuta_redpsicofem'
4. Redirige a /terapeuta/perfil
5. ✅ Terapeuta puede editar solo sus datos
```

---

## 🛡️ Gestión de Usuarios

### Como Admin, puedes:

#### Ver Usuarios Pendientes
```
Ruta: /admin/usuarios
Acción: Ver lista de todos los usuarios con status='pending'
```

#### Aprobar Usuario
```
1. Click en botón "Aprobar"
2. Seleccionar rol:
   - admin
   - terapeuta_red_derivacion
   - terapeuta_redpsicofem
3. Si es terapeuta, seleccionar terapeuta asociado
4. Click en "Aprobar Usuario"
```

#### Rechazar Usuario
```
1. Click en botón "Rechazar"
2. Confirmar acción
3. Usuario no podrá acceder al sistema
```

#### Consultas SQL Útiles

```sql
-- Ver todos los usuarios pendientes
SELECT * FROM public.user_profiles WHERE status = 'pending';

-- Ver todos los usuarios aprobados
SELECT * FROM public.user_profiles WHERE status = 'approved';

-- Ver qué terapeuta está asociado a cada usuario
SELECT
  up.email,
  up.role,
  up.status,
  p.nombre,
  p.apellido
FROM public.user_profiles up
LEFT JOIN public.psicologos p ON up.terapeuta_id = p.id
WHERE up.status = 'approved';

-- Aprobar manualmente un usuario (si es necesario)
UPDATE public.user_profiles
SET
  status = 'approved',
  role = 'terapeuta_red_derivacion',
  terapeuta_id = 1
WHERE email = 'ejemplo@gmail.com';
```

---

## 🧪 Pruebas

### Test 1: Login como Admin

```bash
# 1. Ir a http://localhost:3000/login
# 2. Login con felipe.las.heras@gmail.com
# 3. Verificar redirección a /admin/dashboard
# 4. Verificar acceso a /admin/usuarios
```

### Test 2: Login como Usuario Nuevo

```bash
# 1. Usar una cuenta de Google diferente
# 2. Login desde /login
# 3. Verificar redirección a /pending-approval
# 4. Verificar que aparece en /admin/usuarios (como admin)
```

### Test 3: Aprobar Usuario

```bash
# 1. Como admin, ir a /admin/usuarios
# 2. Aprobar el usuario nuevo
# 3. Asignar rol de terapeuta
# 4. Logout del usuario nuevo
# 5. Login nuevamente
# 6. Verificar acceso a /terapeuta/perfil
```

### Test 4: Protección de Rutas

```bash
# Sin autenticación:
# - Intentar acceder a /admin/dashboard → Redirige a /login
# - Intentar acceder a /terapeuta/perfil → Redirige a /login

# Como terapeuta:
# - Intentar acceder a /admin/dashboard → Mensaje de "Acceso Denegado"

# Como admin:
# - Puede acceder a todas las rutas
```

---

## 🔧 Troubleshooting

### Error: "Usuario no se crea en user_profiles"

**Solución:**
1. Verificar que el trigger `on_auth_user_created` existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Si no existe, ejecutar de nuevo la migración
3. Intentar crear manualmente:
```sql
INSERT INTO public.user_profiles (id, email, status)
SELECT id, email, 'pending'
FROM auth.users
WHERE email = 'tu_email@gmail.com';
```

### Error: "Cannot read profile"

**Solución:**
1. Verificar políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

2. Verificar que el usuario está autenticado:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log(user);
```

### Error: "RLS Error: Permission denied"

**Solución:**
1. Verificar que RLS está habilitado:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_profiles';
```

2. Si rowsecurity es false:
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### Error: "Infinite redirect loop"

**Solución:**
1. Limpiar localStorage:
```javascript
localStorage.clear();
```

2. Verificar que no hay múltiples Providers en App.js
3. Verificar que las rutas están correctamente protegidas

---

## 📱 Rutas del Sistema

### Rutas Públicas
- `/` - Página principal (Formulario de pacientes)
- `/login` - Página de login con Google
- `/terapeutas` - Lista pública de terapeutas
- `/terapeuta/:id` - Perfil público de terapeuta
- `/gracias` - Página de agradecimiento

### Rutas de Autenticación
- `/auth/callback` - Callback de OAuth (Supabase)
- `/pending-approval` - Página de espera de aprobación

### Rutas Protegidas - Admin
- `/admin/dashboard` - Dashboard principal
- `/admin/campos` - Gestión de campos dinámicos
- `/admin/usuarios` - Gestión y aprobación de usuarios

### Rutas Protegidas - Terapeuta
- `/terapeuta/perfil` - Perfil y edición de datos del terapeuta

### Rutas de Formularios
- `/formularioterapeuta` - Formulario de registro de terapeuta
- `/registro-terapeuta` - Wizard de registro de terapeuta

---

## 🎉 ¡Listo!

El sistema de autenticación está completamente configurado.

### Próximos Pasos:

1. ✅ Ejecutar la migración SQL
2. ✅ Iniciar la aplicación: `npm start` en `frontend/`
3. ✅ Hacer login con tu email (felipe.las.heras@gmail.com)
4. ✅ Verificar acceso al dashboard
5. ✅ Probar flujo completo con un usuario nuevo

### Contacto

Si tienes problemas o preguntas:
- Email: felipe.las.heras@gmail.com
- Proyecto Supabase: https://app.supabase.com/project/wshmktlkrydppmwsmvcp
