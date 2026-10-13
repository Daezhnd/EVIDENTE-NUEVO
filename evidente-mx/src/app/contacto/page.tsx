import { Metadata } from 'next';
import { Mail, MessageCircle, MapPin, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contacto | Evidente.mx',
  description: 'Contacta a Evidente.mx por correo o a través de nuestras redes sociales.',
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0067b2] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contáctanos</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            ¿Tienes una noticia, sugerencia o comentario? Escríbenos directamente.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="mailto:contacto@evidente.mx"
            className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <Mail className="w-7 h-7 text-[#0067b2] flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Correo electrónico</h2>
              <p className="text-[#0067b2] break-all">contacto@evidente.mx</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Abre tu aplicación de correo para redactar y enviar el mensaje.
              </p>
            </div>
          </a>

          <a
            href="https://www.facebook.com/EVIDENTE.MX"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <MessageCircle className="w-7 h-7 text-[#0067b2] flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Facebook</h2>
              <p className="text-[#0067b2] flex items-center gap-2">
                Visita EVIDENTE.MX <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Abre nuestra página y utiliza la opción de mensaje de Facebook.
              </p>
            </div>
          </a>
        </div>

        <div className="mt-8 flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <MapPin className="w-5 h-5" aria-hidden="true" />
          <p>Chihuahua, Chihuahua, México.</p>
        </div>
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Para enviar información de interés público, incluye los datos y las fuentes disponibles.
        </p>
      </div>
    </div>
  );
}
