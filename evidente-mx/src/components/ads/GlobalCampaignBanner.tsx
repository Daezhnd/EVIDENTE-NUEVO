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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <a
          href={bannerUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label="Abrir sitio del Instituto Estatal Electoral Chihuahua"
          className="group block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-[#d9c7e7] shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative h-[320px] sm:h-[420px] lg:h-[360px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center opacity-35 blur-lg scale-110"
              style={{ backgroundImage: `url(${bannerImage})` }}
            />
            <div className="absolute inset-0 bg-white/20 dark:bg-black/10" />
            <Image
              src={bannerImage}
              alt="La democracia se construye en nuestra comunidad. Instituto Estatal Electoral Chihuahua."
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 720px, 640px"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/5" />
          </div>
        </a>
      </div>
    </section>
  );
}
