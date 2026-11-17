// Dominio público principal. Vercel redirige evidente.mx → www.evidente.mx, así que toda
// URL absoluta (sitemap, RSS, canónicos, Open Graph, compartir) debe usar `www`: cada
// enlace al dominio sin `www` cuesta una redirección y una petición adicional.
// Si en Vercel se cambia el dominio principal, este es el único valor a actualizar.
export const SITE_URL = 'https://www.evidente.mx';

// Las rutas que definen sus propios `alternates` reemplazan los del layout, así que deben
// volver a declarar el RSS para no perder su autodescubrimiento.
export const RSS_ALTERNATE = { 'application/rss+xml': `${SITE_URL}/feed.xml` };
