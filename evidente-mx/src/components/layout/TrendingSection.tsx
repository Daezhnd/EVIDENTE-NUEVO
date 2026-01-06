'use client';

import Link from 'next/link';
import { TrendingUp, Hash, Clock, ArrowUpRight } from 'lucide-react';

interface TrendingTopic {
  id: string;
  tag: string;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendingSectionProps {
  topics?: TrendingTopic[];
}

// Topics de ejemplo (en producción vendrían de la API)
const defaultTopics: TrendingTopic[] = [
  { id: '1', tag: 'Elecciones2024', mentions: 12500, trend: 'up' },
  { id: '2', tag: 'QuintanaRoo', mentions: 8900, trend: 'up' },
  { id: '3', tag: 'TurismoMéxico', mentions: 7200, trend: 'stable' },
  { id: '4', tag: 'DeportesQRoo', mentions: 5600, trend: 'up' },
  { id: '5', tag: 'CancúnHoy', mentions: 4300, trend: 'down' },
  { id: '6', tag: 'EconomíaMX', mentions: 3800, trend: 'stable' },
];

export function TrendingSection({ topics = defaultTopics }: TrendingSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 relative overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Trending Ahora</h2>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Actualizado hace 5 min
                </p>
              </div>
            </div>
          </div>

          {/* Grid de topics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/buscar?q=${topic.tag}`}
                className="group relative"
              >
                <div className={`
                  p-4 rounded-2xl border border-white/10 
                  bg-white/5 backdrop-blur-sm
                  hover:bg-white/10 hover:border-red-500/50
                  transition-all duration-300
                  ${index === 0 ? 'ring-2 ring-red-500/50' : ''}
                `}>
                  {/* Número de posición */}
                  <div className={`
                    absolute -top-2 -left-2 w-6 h-6 rounded-full 
                    flex items-center justify-center text-xs font-bold
                    ${index === 0 
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' 
                      : 'bg-gray-700 text-gray-300'
                    }
                  `}>
                    {index + 1}
                  </div>

                  {/* Tag */}
                  <div className="flex items-center gap-1 mb-2">
                    <Hash className="w-4 h-4 text-red-400" />
                    <span className="text-white font-semibold text-sm truncate">
                      {topic.tag}
                    </span>
                  </div>

                  {/* Menciones y tendencia */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      {formatNumber(topic.mentions)}
                    </span>
                    <div className={`
                      flex items-center gap-0.5 text-xs
                      ${topic.trend === 'up' ? 'text-green-400' : topic.trend === 'down' ? 'text-red-400' : 'text-gray-400'}
                    `}>
                      {topic.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {topic.trend === 'down' && <ArrowUpRight className="w-3 h-3 rotate-90" />}
                      {topic.trend === 'stable' && <span>—</span>}
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>

          {/* Tags rápidos */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-gray-500 text-sm">También popular:</span>
            {['Política', 'Clima', 'Cultura', 'Tecnología', 'Salud'].map((tag) => (
              <Link
                key={tag}
                href={`/categoria/${tag.toLowerCase()}`}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-full border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
