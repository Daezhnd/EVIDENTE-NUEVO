import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1a1b1f] text-gray-400 font-sans">
      {/* Top Colorful Border */}
      <div className="flex h-1">
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-gray-400"></div>
        <div className="flex-1 bg-red-500"></div>
        <div className="flex-1 bg-black"></div>
        <div className="flex-1 bg-red-700"></div>
        <div className="flex-1 bg-gray-500"></div>
        <div className="flex-1 bg-white"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1: Logo */}
          <div className="flex flex-col items-start">
            <Link href="/" className="mb-6">
              <Image
                src="/logo.png"
                alt="Evidente Logo"
                width={200}
                height={60}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Column 2: Nosotros */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Nosotros</h3>
            <p className="text-sm leading-relaxed mb-6 text-gray-400">
              Conexión directa con la actualidad mundial. Una plataforma informativa dedicada a reportar los hechos más trascendentes con inmediatez, precisión y una perspectiva sin fronteras.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/EVIDENTE.MX"


                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/evidentemx/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.youtube.com/@EVIDENTEMX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Column 3: Información Adicional */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Información Adicional</h3>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-gray-300">Director General:</strong> Wilhelmy Guzman Paniagua
              </p>
              <p>
                <strong className="text-gray-300">Director Editorial:</strong> David Hernández Navarro
              </p>
              <p>
                <strong className="text-gray-300">Gerente:</strong> José Montañez Mata
              </p>
              <p>
                <strong className="text-gray-300">Tel:</strong> 614-131-8497
              </p>
              <p className="flex items-center gap-2">
                <strong className="text-gray-300">Ciudad:</strong> Chihuahua
              </p>
              <p className="flex items-center gap-2">
                <strong className="text-gray-300">Email:</strong>
                <a href="mailto:Contacto@evidente.mx" className="hover:text-white transition-colors">
                  Contacto@evidente.mx
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Evidente.mx. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

