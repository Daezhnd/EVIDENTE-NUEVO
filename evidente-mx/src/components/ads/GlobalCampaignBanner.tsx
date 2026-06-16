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
    <aside className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40">
      <a
        href={bannerUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label="Abrir sitio del Instituto Estatal Electoral Chihuahua"
        className="group block w-[180px] 2xl:w-[220px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg transition-shadow hover:shadow-xl"
      >
        <div className="relative aspect-square">
          <Image
            src={bannerImage}
            alt="La democracia se construye en nuestra comunidad. Instituto Estatal Electoral Chihuahua."
            fill
            priority
            sizes="(max-width: 1535px) 180px, 220px"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/5" />
        </div>
      </a>
    </aside>
  );
}
