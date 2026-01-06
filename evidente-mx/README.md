# Evidente.mx - Portal de Noticias

Portal de noticias moderno construido con Next.js 16, React 19, Supabase y Tailwind CSS.

## 🚀 Características

- **Frontend moderno**: Next.js 16 con App Router y React 19
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS 4
- **Panel de Admin**: Gestión de artículos y reels
- **SEO optimizado**: Metadata dinámica por página
- **Responsive**: Diseño adaptable a todos los dispositivos

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/evidente-mx.git
cd evidente-mx
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
```

4. **Configurar la base de datos**

Ejecuta los scripts SQL en tu proyecto de Supabase:
- `supabase/schema.sql` - Estructura de tablas
- `supabase/seed.sql` - Datos de ejemplo (opcional)

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

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
- **users**: Usuarios del sistema

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
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura las variables de entorno
3. Deploy automático en cada push

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
