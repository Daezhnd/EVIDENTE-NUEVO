-- Ejecutar despues de schema.sql con el propietario SQL en un proyecto nuevo.
-- Todos los usuarios, publicaciones y objetos de prueba desaparecen con ROLLBACK.
BEGIN;
SET LOCAL plpgsql.check_asserts = on;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@schema-check.invalid', '{"full_name":"Autor de prueba"}'),
    ('10000000-0000-0000-0000-000000000002', 'editor@schema-check.invalid', '{}'),
    ('10000000-0000-0000-0000-000000000003', 'publisher@schema-check.invalid', '{}'),
    ('10000000-0000-0000-0000-000000000004', 'viewer@schema-check.invalid', '{"role":"admin"}');
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@schema-check.invalid';
UPDATE public.profiles SET role = 'editor' WHERE email = 'editor@schema-check.invalid';
UPDATE public.profiles SET role = 'publisher' WHERE email = 'publisher@schema-check.invalid';

INSERT INTO public.articles (id, title, slug, summary, content, category, author_id, is_published) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Publico', 'schema-check-publico', 'Resumen', 'Contenido',
        'Internacionales', '10000000-0000-0000-0000-000000000001', true),
    ('20000000-0000-0000-0000-000000000002', 'Privado', 'schema-check-privado', 'Resumen', 'Contenido',
        'Entretenimiento', '10000000-0000-0000-0000-000000000001', false);
INSERT INTO public.reels (video_url, is_published) VALUES ('schema-check-publico.mp4', true), ('schema-check-privado.mp4', false);
INSERT INTO public.newsletter_subscribers (email) VALUES ('privado@schema-check.invalid');
INSERT INTO public.users (email, role) VALUES ('invitado@schema-check.invalid', 'editor');
INSERT INTO storage.buckets (id, name, public) VALUES ('schema-check-private', 'schema-check-private', false);
INSERT INTO storage.objects (bucket_id, name) VALUES
    ('media', 'schema-check-visible.jpg'), ('schema-check-private', 'schema-check-hidden.jpg');

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM public.articles WHERE slug LIKE 'schema-check-%') = 1, 'Anon ve borradores';
    ASSERT (SELECT COUNT(*) FROM public.reels WHERE video_url LIKE 'schema-check-%') = 1, 'Anon ve reels privados';
    ASSERT (SELECT COUNT(*) FROM public.public_articles WHERE slug LIKE 'schema-check-%') = 1, 'Vista publica incluye borradores';
    ASSERT (SELECT author_name FROM public.public_articles WHERE slug = 'schema-check-publico') = 'Autor de prueba';
    ASSERT (SELECT COUNT(*) FROM storage.objects WHERE name LIKE 'schema-check-%') = 1, 'Storage expone otro bucket';
    BEGIN
        PERFORM email FROM public.profiles;
        RAISE EXCEPTION 'Anon puede leer perfiles';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        PERFORM email FROM public.newsletter_subscribers;
        RAISE EXCEPTION 'Anon puede leer suscriptores';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        PERFORM email FROM public.users;
        RAISE EXCEPTION 'Anon puede leer miembros';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO public.newsletter_subscribers (email) VALUES ('bypass@schema-check.invalid');
        RAISE EXCEPTION 'Anon puede saltarse el API de newsletter';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        UPDATE public.articles SET title = 'Alterado';
        RAISE EXCEPTION 'Anon puede editar articulos';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    PERFORM public.increment_views('20000000-0000-0000-0000-000000000001');
    PERFORM public.increment_views('20000000-0000-0000-0000-000000000002');
END;
$$;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
DO $$
BEGIN
    ASSERT (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'viewer', 'Metadata puede elevar el rol';
    ASSERT (SELECT full_name FROM public.profiles WHERE id = auth.uid()) IS NULL, 'Nombre publico usa el correo';
    ASSERT (SELECT COUNT(*) FROM public.profiles) = 1, 'Viewer puede leer otros perfiles';
    ASSERT (SELECT COUNT(*) FROM public.newsletter_subscribers) = 0, 'Viewer puede leer newsletter';
    ASSERT (SELECT COUNT(*) FROM public.users) = 0, 'Viewer puede leer miembros';
    UPDATE public.profiles SET full_name = 'Mi nombre' WHERE id = auth.uid();
    ASSERT (SELECT full_name FROM public.profiles WHERE id = auth.uid()) = 'Mi nombre';
    BEGIN
        UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
        RAISE EXCEPTION 'Viewer puede elevar su rol';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        UPDATE public.profiles SET email = 'otro@schema-check.invalid' WHERE id = auth.uid();
        RAISE EXCEPTION 'Viewer puede cambiar identidad del perfil';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO public.articles (title, slug, summary, content, category)
        VALUES ('Prohibido', 'schema-check-viewer', '', '', 'Destacadas');
        RAISE EXCEPTION 'Viewer puede crear articulos';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO storage.objects (bucket_id, name) VALUES ('media', 'schema-check-viewer.jpg');
        RAISE EXCEPTION 'Viewer puede subir archivos';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
DO $$
DECLARE
    inserted_id UUID;
    changed INTEGER;
BEGIN
    INSERT INTO public.articles (title, slug, summary, content, category)
    VALUES ('Borrador publisher', 'schema-check-publisher', '', '', 'Entretenimiento') RETURNING id INTO inserted_id;
    ASSERT (SELECT author_id FROM public.articles WHERE id = inserted_id) = auth.uid(), 'Autor por defecto incorrecto';
    UPDATE public.articles SET title = 'No permitido' WHERE id = inserted_id;
    GET DIAGNOSTICS changed = ROW_COUNT;
    ASSERT changed = 0, 'Publisher puede editar';
    DELETE FROM public.articles WHERE id = inserted_id;
    GET DIAGNOSTICS changed = ROW_COUNT;
    ASSERT changed = 0, 'Publisher puede eliminar';
    INSERT INTO public.reels (video_url) VALUES ('schema-check-publisher.mp4') RETURNING id INTO inserted_id;
    ASSERT (SELECT author_id FROM public.reels WHERE id = inserted_id) = auth.uid();
    INSERT INTO storage.objects (bucket_id, name) VALUES ('videos', 'schema-check-publisher.jpg');
    BEGIN
        INSERT INTO public.articles (title, slug, summary, content, category, author_id)
        VALUES ('Otro autor', 'schema-check-spoof', '', '', 'Destacadas', '10000000-0000-0000-0000-000000000001');
        RAISE EXCEPTION 'Publisher puede suplantar autor';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO storage.objects (bucket_id, name) VALUES ('schema-check-private', 'schema-check-publisher.jpg');
        RAISE EXCEPTION 'Publisher puede escribir otro bucket';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
DO $$
DECLARE changed INTEGER;
BEGIN
    ASSERT (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@schema-check.invalid') = 4, 'Editor no puede gestionar perfiles';
    ASSERT (SELECT COUNT(*) FROM public.newsletter_subscribers WHERE email = 'privado@schema-check.invalid') = 1;
    UPDATE public.articles SET title = 'Editado' WHERE slug = 'schema-check-publisher';
    GET DIAGNOSTICS changed = ROW_COUNT;
    ASSERT changed = 1, 'Editor no puede editar';
    DELETE FROM public.articles WHERE slug = 'schema-check-publisher';
    GET DIAGNOSTICS changed = ROW_COUNT;
    ASSERT changed = 1, 'Editor no puede eliminar';
    INSERT INTO public.users (email, role) VALUES ('publisher-invitado@schema-check.invalid', 'publisher');
    DELETE FROM public.users WHERE email = 'publisher-invitado@schema-check.invalid';
END;
$$;

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
DO $$
BEGIN
    ASSERT public.current_user_role() = 'admin';
    ASSERT (SELECT COUNT(*) FROM public.users WHERE email = 'invitado@schema-check.invalid') = 1;
    ASSERT (SELECT COUNT(*) FROM public.articles WHERE slug LIKE 'schema-check-%') = 2;
    BEGIN
        UPDATE public.profiles SET role = 'admin' WHERE email = 'viewer@schema-check.invalid';
        RAISE EXCEPTION 'Los roles se pueden cambiar desde el cliente';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

SET LOCAL ROLE service_role;
SELECT set_config('request.jwt.claim.sub', '', true);
UPDATE public.newsletter_subscribers SET is_active = false WHERE email = 'privado@schema-check.invalid';
UPDATE public.newsletter_subscribers SET is_active = true, unsubscribed_at = NULL WHERE email = 'privado@schema-check.invalid';
DO $$
BEGIN
    ASSERT (SELECT is_active FROM public.newsletter_subscribers WHERE email = 'privado@schema-check.invalid'), 'Service role no puede reactivar';
END;
$$;

RESET ROLE;
DO $$
BEGIN
    ASSERT (SELECT views_count FROM public.articles WHERE id = '20000000-0000-0000-0000-000000000001') = 1, 'No incrementa vistas publicas';
    ASSERT (SELECT views_count FROM public.articles WHERE id = '20000000-0000-0000-0000-000000000002') = 0, 'Incrementa vistas privadas';
    ASSERT (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('media', 'videos') AND public) = 2, 'Faltan buckets publicos';
    ASSERT NOT has_table_privilege('anon', 'public.newsletter_subscribers', 'SELECT');
    ASSERT NOT has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE');
END;
$$;

ROLLBACK;
