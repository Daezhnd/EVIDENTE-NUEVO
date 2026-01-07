import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { NewsletterForm } from '@/components/home/NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Mantente informado
              </h3>
              <p className="text-gray-400">
                Recibe las noticias más importantes directamente en tu correo. Sin spam, solo contenido de valor.
              </p>
            </div>
            <NewsletterForm variant="inline" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            Evidente<span className="text-cyan-500">.mx</span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link href="/categoria/destacadas" className="hover:text-white">Destacadas</Link>
            <Link href="/categoria/noticias" className="hover:text-white">Noticias</Link>
            <Link href="/categoria/deportes" className="hover:text-white">Deportes</Link>
            <Link href="/categoria/turismo" className="hover:text-white">Turismo</Link>
            <Link href="/reels" className="hover:text-white">Reels</Link>
            <Link href="/contacto" className="hover:text-white">Contacto</Link>
          </nav>

          {/* Social */}
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-800 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Evidente.mx — Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
