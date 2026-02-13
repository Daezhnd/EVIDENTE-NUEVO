import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Editar Artículo | Admin - Evidente.mx',
  description: 'Editar artículo existente',
};

async function getArticle(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  // Solo admin y editor pueden editar artículos
  await requireRole(['admin', 'editor']);
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 md:pt-8 md:ml-64">
        <ArticleForm article={article} isEditing={true} />
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
