'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

const bannerImage = '/ads/iee-democracia-comunidad.jpg';
const bannerUrl = 'https://ieechihuahua.org.mx';

export function GlobalCampaignBanner() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <a
          href={bannerUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label="Abrir sitio del Instituto Estatal Electoral Chihuahua"
          className="group block w-full max-w-[280px] sm:max-w-[320px] mx-auto overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-square">
            <Image
              src={bannerImage}
              alt="La democracia se construye en nuestra comunidad. Instituto Estatal Electoral Chihuahua."
              fill
              priority
              sizes="(max-width: 640px) 280px, 320px"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/5" />
          </div>
        </a>
      </div>
    </section>
  );
}
