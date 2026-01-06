'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, User, Play } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';

const categories = [
  { name: 'Inicio', href: '/' },
  { name: 'Destacadas', href: '/categoria/destacadas' },
  { name: 'Noticias', href: '/categoria/noticias' },
  { name: 'Deportes', href: '/categoria/deportes' },
  { name: 'Turismo', href: '/categoria/turismo' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Ir a inicio - Evidente.mx">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Evidente<span className="text-blue-900 dark:text-blue-400">.mx</span>
            </span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/reels"
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 text-sm font-medium bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors"
              aria-label="Ver videos cortos (Reels)"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Reels
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            <ThemeToggleCompact />
            
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
              aria-label={isSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
              aria-expanded={isSearchOpen}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Panel de administración"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              Admin
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        {isSearchOpen && (
          <div className="py-3 border-t border-gray-100">
            <form action="/buscar" method="GET" className="relative">
              <input
                type="search"
                name="q"
                placeholder="Buscar noticias..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900 text-sm"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white" role="navigation" aria-label="Menú móvil">
          <nav className="px-4 py-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/reels"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-red-600 font-medium"
            >
              <Play className="w-4 h-4" />
              Reels
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
