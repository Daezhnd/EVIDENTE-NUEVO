-- =============================================
-- EVIDENTE.MX - Schema de Base de Datos
-- Portal de Noticias con Supabase
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

-- Tipo ENUM para categorías de artículos
CREATE TYPE article_category AS ENUM ('Destacadas', 'Noticias', 'Deportes', 'Turismo');

-- Tipo ENUM para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- =============================================
-- TABLAS PRINCIPALES
-- =============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de artículos/noticias
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    category article_category NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reels (videos cortos)
CREATE TABLE reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscriptores al newsletter
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_reels_published_at ON reels(published_at DESC);
CREATE INDEX idx_reels_is_published ON reels(is_published);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reels_updated_at
    BEFORE UPDATE ON reels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para generar slug automático
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRANSLATE(title, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil en registro
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfiles públicos visibles para todos"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para articles
CREATE POLICY "Artículos publicados visibles para todos"
    ON articles FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins pueden ver todos los artículos"
    ON articles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden crear artículos"
    ON articles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden actualizar artículos"
    ON articles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden eliminar artículos"
    ON articles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Políticas para reels
CREATE POLICY "Reels publicados visibles para todos"
    ON reels FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins pueden ver todos los reels"
    ON reels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden crear reels"
    ON reels FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden actualizar reels"
    ON reels FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden eliminar reels"
    ON reels FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista de artículos públicos con información del autor
CREATE OR REPLACE VIEW public_articles AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.content,
    a.image_url,
    a.video_url,
    a.category,
    a.views_count,
    a.published_at,
    p.full_name AS author_name,
    p.avatar_url AS author_avatar
FROM articles a
LEFT JOIN profiles p ON a.author_id = p.id
WHERE a.is_published = true
ORDER BY a.published_at DESC;

-- Vista de reels públicos
CREATE OR REPLACE VIEW public_reels AS
SELECT 
    r.id,
    r.video_url,
    r.thumbnail_url,
    r.caption,
    r.views_count,
    r.likes_count,
    r.published_at,
    p.full_name AS author_name
FROM reels r
LEFT JOIN profiles p ON r.author_id = p.id
WHERE r.is_published = true
ORDER BY r.published_at DESC;
