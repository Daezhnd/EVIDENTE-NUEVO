'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, User, Play } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';

const categories = [
  { name: 'Inicio', href: '/', borderColor: 'border-gray-400 dark:border-gray-500', hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-800/50' },
  { name: 'Destacadas', href: '/categoria/destacadas', borderColor: 'border-red-500', hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/30' },
  { name: 'Internacionales', href: '/categoria/internacionales', borderColor: 'border-cyan-500', hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/30' },
  { name: 'Entretenimiento', href: '/categoria/entretenimiento', borderColor: 'border-purple-500', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/30' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Menú móvil - Izquierda */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>

          {/* Navegación desktop - Centrada */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-1 absolute left-1/2 -translate-x-1/2" aria-label="Navegación principal">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 transition-all border-t-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Inicio
            </Link>
            <Link
              href="/categoria/destacadas"
              className="px-3 py-2 text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 transition-all border-t-2 border-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/60"
            >
              Destacadas
            </Link>
            <Link
              href="/categoria/internacionales"
              className="px-3 py-2 text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 transition-all border-t-2 border-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-800/60"
            >
              Internacionales
            </Link>
            <Link
              href="/categoria/entretenimiento"
              className="px-3 py-2 text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 transition-all border-t-2 border-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/60"
            >
              Entretenimiento
            </Link>
            <Link
              href="/reels"
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 text-sm font-bold bg-gradient-to-r from-evident to-evident-dark text-white rounded-full hover:shadow-lg transition-all hover:scale-105"
              aria-label="Ver videos cortos (Reels)"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" fill="currentColor" />
              Reels
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            <ThemeToggleCompact />

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-evident dark:hover:text-blue-400 transition-colors"
              aria-label={isSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
              aria-expanded={isSearchOpen}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Panel de administración"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
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
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-evident text-sm"
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
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              <User className="w-4 h-4" />
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
