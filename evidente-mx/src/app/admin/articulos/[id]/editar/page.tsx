import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

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
  await requireAuth();
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-64">
        <ArticleForm article={article} isEditing={true} />
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
