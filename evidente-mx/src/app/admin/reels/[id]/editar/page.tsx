import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ReelForm } from '@/components/admin/ReelForm';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

interface EditReelPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Editar Reel | Admin - Evidente.mx',
  description: 'Editar reel existente',
};

async function getReel(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reels')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function EditReelPage({ params }: EditReelPageProps) {
  // Solo admin y editor pueden editar reels
  await requireRole(['admin', 'editor']);
  const { id } = await params;
  const reel = await getReel(id);

  if (!reel) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 ml-64">
        <ReelForm reel={reel} isEditing={true} />
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
