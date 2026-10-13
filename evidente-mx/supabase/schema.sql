-- Ejecutar una vez en un proyecto Supabase nuevo y vacio. No incluye datos de prueba.
-- Crear el primer usuario desde Auth y asignar profiles.role = 'admin' desde el dashboard.
BEGIN;

-- El trigger opcional de RLS de Supabase no es una funcion para clientes.
DO $$ BEGIN
    IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    END IF;
END $$;

CREATE TYPE public.article_category AS ENUM (
    'Destacadas', 'Internacionales', 'Entretenimiento', 'Noticias', 'Deportes', 'Turismo'
);
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'publisher', 'viewer');

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    category public.article_category NOT NULL,
    author_id UUID DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    author_id UUID DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- shortcut: este registro no crea ni revoca cuentas Auth, usar invitaciones Auth reales al ampliar gestion de miembros.
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role public.user_role NOT NULL DEFAULT 'editor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ
);

CREATE INDEX idx_articles_category_published ON public.articles (category, published_at DESC) WHERE is_published;
CREATE INDEX idx_articles_published_at ON public.articles (published_at DESC) WHERE is_published;
CREATE INDEX idx_articles_created_at ON public.articles (created_at DESC);
CREATE INDEX idx_reels_published_at ON public.reels (published_at DESC) WHERE is_published;
CREATE INDEX idx_reels_created_at ON public.reels (created_at DESC);

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reels_updated_at BEFORE UPDATE ON public.reels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NULLIF(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Lee solo el rol del solicitante y evita recursion de RLS en profiles.
CREATE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- shortcut: el contador es publico y no limita frecuencia, agregar rate limiting si se necesita resistir vistas artificiales.
CREATE FUNCTION public.increment_views(article_id UUID)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
    UPDATE public.articles SET views_count = views_count + 1
    WHERE id = article_id AND is_published;
$$;

REVOKE ALL ON FUNCTION public.update_updated_at_column(), public.handle_new_user(),
    public.current_user_role(), public.increment_views(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated, service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.profiles, public.articles, public.reels,
    public.newsletter_subscribers, public.users FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.profiles TO authenticated;
-- El rol, correo e id se administran exclusivamente con credenciales del servidor/dashboard.
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;
GRANT SELECT ON public.articles, public.reels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles, public.reels TO authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.users TO authenticated;
GRANT ALL ON public.profiles, public.articles, public.reels,
    public.newsletter_subscribers, public.users TO service_role;

CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()) OR (SELECT public.current_user_role()) IN ('admin', 'editor'));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY articles_public_read ON public.articles FOR SELECT TO anon, authenticated
    USING (is_published);
CREATE POLICY articles_staff_read ON public.articles FOR SELECT TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor')
        OR ((SELECT public.current_user_role()) = 'publisher' AND author_id = (SELECT auth.uid())));
CREATE POLICY articles_create ON public.articles FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_role()) IN ('admin', 'editor', 'publisher')
        AND (author_id = (SELECT auth.uid()) OR (SELECT public.current_user_role()) IN ('admin', 'editor')));
CREATE POLICY articles_update ON public.articles FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'))
    WITH CHECK ((SELECT public.current_user_role()) IN ('admin', 'editor'));
CREATE POLICY articles_delete ON public.articles FOR DELETE TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'));

CREATE POLICY reels_public_read ON public.reels FOR SELECT TO anon, authenticated
    USING (is_published);
CREATE POLICY reels_staff_read ON public.reels FOR SELECT TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor')
        OR ((SELECT public.current_user_role()) = 'publisher' AND author_id = (SELECT auth.uid())));
CREATE POLICY reels_create ON public.reels FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_role()) IN ('admin', 'editor', 'publisher')
        AND (author_id = (SELECT auth.uid()) OR (SELECT public.current_user_role()) IN ('admin', 'editor')));
CREATE POLICY reels_update ON public.reels FOR UPDATE TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'))
    WITH CHECK ((SELECT public.current_user_role()) IN ('admin', 'editor'));
CREATE POLICY reels_delete ON public.reels FOR DELETE TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'));

-- Las altas y reactivaciones del formulario pasan por /api/newsletter con service_role.
CREATE POLICY newsletter_staff_read ON public.newsletter_subscribers FOR SELECT TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'));

CREATE POLICY users_staff_read ON public.users FOR SELECT TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'));
CREATE POLICY users_staff_create ON public.users FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.current_user_role()) IN ('admin', 'editor'));
CREATE POLICY users_staff_delete ON public.users FOR DELETE TO authenticated
    USING ((SELECT public.current_user_role()) IN ('admin', 'editor'));

-- Vistas publicas limitadas a publicaciones y datos de autor sin correo ni rol.
CREATE OR REPLACE VIEW public.public_articles WITH (security_barrier = true) AS
SELECT a.id, a.title, a.slug, a.summary, a.content, a.image_url, a.video_url,
    a.category, a.views_count, a.published_at,
    p.full_name AS author_name, p.avatar_url AS author_avatar,
    a.author_id, a.is_published, a.created_at, a.updated_at
FROM public.articles a LEFT JOIN public.profiles p ON a.author_id = p.id
WHERE a.is_published;

CREATE OR REPLACE VIEW public.public_reels WITH (security_barrier = true) AS
SELECT r.id, r.video_url, r.thumbnail_url, r.caption, r.views_count,
    r.likes_count, r.published_at, p.full_name AS author_name,
    r.author_id, r.is_published, r.created_at, r.updated_at
FROM public.reels r LEFT JOIN public.profiles p ON r.author_id = p.id
WHERE r.is_published;

REVOKE ALL ON public.public_articles, public.public_reels FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_articles, public.public_reels TO anon, authenticated, service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
    ('media', 'media', true, 5242880, ARRAY['image/*']),
    ('videos', 'videos', true, 52428800, ARRAY['video/*', 'image/jpeg']);

GRANT SELECT ON storage.objects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets, storage.objects TO service_role;

CREATE POLICY evidente_media_read ON storage.objects FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('media', 'videos'));
CREATE POLICY evidente_media_create ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('media', 'videos')
        AND (SELECT public.current_user_role()) IN ('admin', 'editor', 'publisher'));
CREATE POLICY evidente_media_update ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id IN ('media', 'videos') AND (SELECT public.current_user_role()) IN ('admin', 'editor'))
    WITH CHECK (bucket_id IN ('media', 'videos') AND (SELECT public.current_user_role()) IN ('admin', 'editor'));
CREATE POLICY evidente_media_delete ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id IN ('media', 'videos') AND (SELECT public.current_user_role()) IN ('admin', 'editor'));

-- Fallar la transaccion si un permiso publico contradice la privacidad esperada.
DO $$
BEGIN
    IF has_table_privilege('anon', 'public.profiles', 'SELECT')
        OR has_table_privilege('anon', 'public.newsletter_subscribers', 'SELECT')
        OR has_table_privilege('anon', 'public.newsletter_subscribers', 'INSERT')
        OR has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')
        OR has_table_privilege('anon', 'public.articles', 'UPDATE') THEN
        RAISE EXCEPTION 'Los permisos de Evidente exponen datos privados o permiten elevar roles';
    END IF;
END;
$$;

COMMIT;
