import { Metadata } from 'next';
import { ReelPlayer } from '@/components/reels/ReelPlayer';
import { createClient } from '@/lib/supabase/public';
import { Reel } from '@/types/database';

export const metadata: Metadata = {
  title: 'Reels | Evidente.mx',
  description: 'Videos cortos de actualidad, entretenimiento y noticias de México.',
};

async function getReels(limit: number = 20): Promise<Reel[]> {
  const supabase = await createClient(['reels:list']);
  const { data } = await supabase
    .from('reels')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();
  
  return data || [];
}

export default async function ReelsPage() {
  // Cargar desde Supabase
  const reels = await getReels(20);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Reels</h1>
          <p className="text-gray-400 text-sm">Videos cortos de actualidad</p>
        </div>
      </div>

      {/* Grid de Reels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
          {reels.map((reel, index) => (
            <ReelPlayer
              key={reel.id}
              reel={reel}
              isActive={index === 0}
            />
          ))}
        </div>

        {reels.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No hay reels disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 300;
