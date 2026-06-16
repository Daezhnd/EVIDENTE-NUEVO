'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

const bannerImage = '/ads/iee-democracia-comunidad.jpg';
const bannerUrl = 'https://ieechihuahua.org.mx';

export function GlobalCampaignBanner() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const visibilityClass = isHomePage
    ? 'hidden xl:block [@media(max-height:1199px)]:hidden'
    : 'hidden xl:block';
  const sidePositionClass = isHomePage
    ? 'right-[67px] 2xl:right-[47px] top-[calc(60vh-483px)] 2xl:top-[calc(60vh-531px)]'
    : 'right-4';
  const verticalPositionClass = isHomePage
    ? ''
    : 'top-1/2 -translate-y-1/2';

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <aside className={`${visibilityClass} fixed ${sidePositionClass} ${verticalPositionClass} z-40`}>
      <a
        href={bannerUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label="Abrir sitio del Instituto Estatal Electoral Chihuahua"
        className="group block w-[180px] 2xl:w-[220px] overflow-hidden rounded-md border border-red-200 bg-white p-2 shadow-xl shadow-black/20 transition-shadow hover:shadow-2xl"
      >
        <span className="mb-2 block text-center text-[10px] font-black uppercase tracking-[0.22em] text-red-600">
          Publicidad
        </span>
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
        <span className="mt-2 block rounded bg-red-600 px-2 py-1.5 text-center text-xs font-bold text-white transition-colors group-hover:bg-red-700">
          Visitar sitio
        </span>
      </a>
    </aside>
  );
}

export function CampaignBannerInline() {
  return (
    <section className="bg-white dark:bg-gray-950 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <a
          href={bannerUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label="Abrir sitio del Instituto Estatal Electoral Chihuahua"
          className="group mx-auto flex max-w-5xl flex-col overflow-hidden rounded-lg border-2 border-red-100 bg-white shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-2xl md:flex-row"
        >
          <div className="relative aspect-square w-full bg-[#dcccea] md:w-[280px] lg:w-[320px] md:flex-shrink-0">
            <Image
              src={bannerImage}
              alt="La democracia se construye en nuestra comunidad. Instituto Estatal Electoral Chihuahua."
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 p-5 sm:p-6 md:flex-1 lg:p-8">
            <span className="w-fit rounded bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-red-600">
              Publicidad
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight text-gray-950">
                La democracia se construye en nuestra comunidad
              </h2>
              <p className="mt-2 text-sm sm:text-base font-semibold text-gray-500">
                Instituto Estatal Electoral Chihuahua
              </p>
            </div>
            <span className="inline-flex w-fit items-center justify-center rounded bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-red-700">
              Visitar sitio
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
