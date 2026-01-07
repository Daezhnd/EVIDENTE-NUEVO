import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Número 404 estilizado */}
        <div className="relative mb-8">
          <span className="text-[180px] font-black text-gray-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-black text-blue-900">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Página no encontrada
        </h1>

        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>

          <Link
            href="/buscar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors font-medium"
          >
            <Search className="w-4 h-4" />
            Buscar noticias
          </Link>
        </div>

        {/* Categorías sugeridas */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">O explora nuestras secciones:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: 'Destacadas', href: '/categoria/destacadas' },
              { name: 'Noticias', href: '/categoria/noticias' },
              { name: 'Deportes', href: '/categoria/deportes' },
              { name: 'Turismo', href: '/categoria/turismo' },
              { name: 'Reels', href: '/reels' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="px-3 py-1.5 text-sm bg-white rounded-full border border-gray-200 hover:border-blue-900 hover:text-blue-900 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
