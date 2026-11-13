import type { ArticleCategory } from '@/types/database';

export const CATEGORY_PAGE_SIZE = 9;

// Mapeo de slugs a categorías
export const categoryMap: Record<string, ArticleCategory> = {
  'destacadas': 'Destacadas',
  'internacionales': 'Internacionales',
  'entretenimiento': 'Entretenimiento',
  'noticias': 'Noticias', // Legacy support
  'deportes': 'Deportes', // Legacy support
  'turismo': 'Turismo', // Legacy support
};

export const categoryDescriptions: Record<ArticleCategory, string> = {
  'Destacadas': 'Las noticias más importantes y relevantes del momento.',
  'Internacionales': 'Acontecimientos globales y noticias de impacto mundial.',
  'Entretenimiento': 'Cultura, espectáculos y novedades del mundo del entretenimiento.',
  'Noticias': 'Mantente informado con las últimas noticias de México y el mundo.',
  'Deportes': 'Todo sobre fútbol, boxeo, tenis y más deportes.',
  'Turismo': 'Descubre los mejores destinos y experiencias de viaje en México.',
};
