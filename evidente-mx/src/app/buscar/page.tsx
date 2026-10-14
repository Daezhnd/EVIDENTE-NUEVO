import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/public';
import { Article } from '@/types/database';
import { Search, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Buscar | Evidente.mx',
  description: 'Busca noticias, artículos y contenido en Evidente.mx',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchArticles(query: string): Promise<Article[]> {
  if (!query || query.length < 2) return [];
  
  const supabase = await createClient(['articles:list']);
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20)
    .throwOnError();

  return data || [];
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
  if (diff < 60) return `hace ${diff} min`;
  if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
  return `hace ${Math.floor(diff / 1440)}d`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';
  const results = await searchArticles(query);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de búsqueda */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Buscar noticias</h1>
          
          <form action="/buscar" method="GET" className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="¿Qué estás buscando?"
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#0067b2] text-white rounded-lg hover:bg-[#00528e] transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {query && (
          <p className="text-gray-600 mb-6">
            {results.length === 0 
              ? `No se encontraron resultados para "${query}"`
              : `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`
            }
          </p>
        )}

        {!query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Escribe algo para buscar noticias</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((article) => (
              <Link
                key={article.id}
                href={`/noticia/${article.slug}`}
                className="flex gap-4 bg-white rounded-xl p-4 hover:shadow-lg transition-shadow group"
              >
                {/* Imagen */}
                <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={article.image_url || '/placeholder.svg'}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-[#0067b2] uppercase">
                    {typeof article.category === 'object' ? article.category.name : article.category}
                  </span>
                  <h2 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#0067b2] transition-colors mt-1">
                    {article.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeAgo(article.published_at || article.created_at)}</span>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#0067b2] self-center flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Intenta con otras palabras o explora nuestras categorías:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Destacadas', 'Noticias', 'Deportes', 'Turismo'].map((cat) => (
                <Link
                  key={cat}
                  href={`/categoria/${cat.toLowerCase()}`}
                  className="px-4 py-2 bg-white rounded-lg border hover:border-[#0067b2] hover:text-[#0067b2] transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
