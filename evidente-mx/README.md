# Evidente.mx - Portal de Noticias

Portal de noticias moderno construido con Next.js 15, React 19, Supabase y Tailwind CSS.

## 🚀 Características

- **Frontend moderno**: Next.js 15 con App Router y React 19
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS 4
- **Panel de Admin**: Gestión de artículos y reels
- **SEO optimizado**: Metadata dinámica por página
- **Responsive**: Diseño adaptable a todos los dispositivos

## 📋 Requisitos

- Node.js 24.15+ dentro de la rama 24 (igual que el proyecto en Vercel)
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Daezhnd/EVIDENTE-NUEVO.git
cd EVIDENTE-NUEVO/evidente-mx
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
API_SECRET_KEY=un-secreto-aleatorio-para-la-api-de-articulos
```

La URL y ambas claves de Supabase deben pertenecer al mismo proyecto. La clave pública
`anon` (o `publishable`) se utiliza con las políticas RLS. `SUPABASE_SERVICE_ROLE_KEY`
es la clave `service_role` (o `secret`), exclusiva del servidor: la usan la API de
artículos y el newsletter. `API_SECRET_KEY` es un secreto independiente para los
clientes que publican artículos mediante `Authorization: Bearer <secreto>`.
Nunca añadas `NEXT_PUBLIC_` a las claves privadas ni guardes `.env.local` en Git.

4. **Configurar la base de datos**

Para un proyecto nuevo y vacío, ejecuta `supabase/schema.sql` completo en el SQL
Editor de Supabase. Incluye tablas, permisos RLS, funciones y buckets de almacenamiento.
No ejecutes `supabase/seed.sql` si quieres empezar sin noticias de ejemplo.

En Authentication → Users, crea el primer usuario con un correo y contraseña que
controles, y confirma el correo. Copia su UUID y asigna el rol desde el SQL Editor:

```sql
update public.profiles set role = 'admin' where id = 'UUID-DEL-USUARIO';
```

Configura Authentication → URL Configuration con el dominio de producción como
Site URL. Inicia sesión en `/admin/login` con ese correo y contraseña.

El panel de usuarios existente mantiene registros en `public.users`; su botón
"Invitar usuario" todavía no crea cuentas en Supabase Auth ni envía invitaciones.
Para dar acceso real a otro editor, crea su usuario en Authentication → Users y
asigna su rol en `public.profiles` desde el SQL Editor.

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Comprobaciones

Los scripts ejecutan el código real con respuestas o servicios simulados; no escriben
datos en Supabase de producción.

```bash
node scripts/check-sanitize.mjs
node scripts/check-article-form.mjs
node scripts/check-public-errors.mjs
node scripts/check-public-cache.mjs
node scripts/check-content-revalidation.mjs
node scripts/check-newsletter.mjs
```

El override de PostCSS corrige la versión vulnerable incluida por Next 15; retirarlo
cuando Next incorpore una versión corregida. La cadena de ESLint conserva un aviso
de `braces` sin parche publicado (GHSA-vfj7-8cjw-p6xm). Es una dependencia de
desarrollo y no debe recibir patrones de archivos de usuarios externos.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Rutas de la aplicación (App Router)
│   ├── admin/             # Panel de administración
│   ├── categoria/[slug]/  # Páginas de categoría
│   ├── noticia/[slug]/    # Páginas de artículos
│   └── reels/             # Sección de reels
├── components/            # Componentes React
│   ├── admin/            # Componentes del admin
│   ├── articles/         # Componentes de artículos
│   ├── home/             # Componentes del home
│   ├── layout/           # Navbar, Footer, etc.
│   ├── reels/            # Componentes de reels
│   └── ui/               # Componentes UI reutilizables
├── lib/                   # Utilidades y configuraciones
│   ├── api.ts            # Funciones de API centralizadas
│   ├── auth.ts           # Helpers de autenticación
│   ├── env.ts            # Validación de variables de entorno
│   ├── utils.ts          # Utilidades generales
│   └── supabase/         # Clientes de Supabase
└── types/                 # Definiciones de TypeScript
    └── database.ts       # Tipos de la base de datos
```

## 🗄️ Base de Datos

### Tablas principales

- **articles**: Artículos de noticias
- **reels**: Videos cortos estilo reel
- **profiles**: Roles de los usuarios de Supabase Auth
- **users**: Registro del panel de usuarios existente
- **newsletter_subscribers**: Suscriptores privados del newsletter

### Categorías disponibles

- Destacadas
- Noticias
- Deportes
- Turismo

## 🔐 Autenticación

El panel de administración (`/admin`) está protegido. Solo usuarios con rol `admin` o `editor` pueden acceder.

## 📜 Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Iniciar producción
npm run lint     # Ejecutar ESLint
node scripts/check-newsletter.mjs  # Verificar newsletter sin servicios externos
node scripts/check-content-revalidation.mjs  # Verificar permisos e invalidación
node scripts/check-public-cache.mjs  # Verificar caché pública y alcance del middleware
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura las cuatro variables de `.env.example` para Production (y para Preview
   solo si ese entorno debe usar el mismo proyecto).
3. Genera un nuevo deployment después de cambiar las variables; las variables
   `NEXT_PUBLIC_*` se incorporan durante el build.

Para cambiar de Supabase desde cero, prepara y prueba el esquema, el acceso de
administrador, una publicación y una subida de archivos antes de cambiar las
variables de Production. La nueva base de datos no incluye noticias, usuarios ni
archivos del proyecto anterior. Conserva el acceso al correo de la nueva cuenta de
Supabase y un método de inicio de sesión independiente de la cuenta de GitHub.

Las lecturas públicas usan una caché de 300 segundos. Guardar, publicar, retirar,
importar o eliminar artículos y reels desde el panel o la API invalida la caché
pública. Si la invalidación falla, la escritura sigue guardada y la renovación
automática actúa como respaldo; los cambios directos en el dashboard de Supabase
también esperan esta renovación. Las sesiones, borradores y llamadas que escriben
datos no se comparten en la caché pública.

### Otras plataformas

Cualquier plataforma que soporte Next.js funcionará (Railway, Render, etc.)

## 📝 Licencia

MIT

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request
