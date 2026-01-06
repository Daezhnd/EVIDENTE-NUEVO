import { Metadata } from 'next';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SimpleBarChart, SimpleLineChart } from '@/components/admin/Charts';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from '@/lib/utils';
import { Article, Reel } from '@/types/database';
import { requireAuth } from '@/lib/auth';
import { 
  FileText, 
  Video, 
  Eye, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Users,
  Mail
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Admin - Evidente.mx',
  description: 'Panel de administración de Evidente.mx',
};

async function getDashboardStats() {
  const supabase = await createClient();
  
  // Contar artículos
  const { count: articlesCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });
  
  // Contar reels
  const { count: reelsCount } = await supabase
    .from('reels')
    .select('*', { count: 'exact', head: true });
  
  // Sumar vistas de artículos
  const { data: articlesViews } = await supabase
    .from('articles')
    .select('views_count');
  
  const totalViews = articlesViews?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0;

  // Contar suscriptores del newsletter (puede que la tabla no exista aún)
  let subscribersCount = 0;
  try {
    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    subscribersCount = count || 0;
  } catch {
    // Tabla no existe aún
  }
  
  return {
    articles: articlesCount || 0,
    reels: reelsCount || 0,
    views: totalViews,
    subscribers: subscribersCount,
  };
}

async function getViewsByCategory() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('category, views_count');
  
  const byCategory: Record<string, number> = {};
  data?.forEach(article => {
    const cat = typeof article.category === 'string' ? article.category : 'Otro';
    byCategory[cat] = (byCategory[cat] || 0) + (article.views_count || 0);
  });
  
  return Object.entries(byCategory).map(([label, value]) => ({ label, value }));
}

async function getRecentArticles(limit: number = 5): Promise<Article[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}

export default async function AdminDashboardPage() {
  // Verificar autenticación
  await requireAuth();
  
  const dashboardStats = await getDashboardStats();
  const recentArticles = await getRecentArticles(5);
  const viewsByCategory = await getViewsByCategory();

  const stats = [
    { 
      label: 'Total Artículos', 
      value: dashboardStats.articles.toString(), 
      icon: FileText,
      color: 'bg-blue-900'
    },
    { 
      label: 'Total Reels', 
      value: dashboardStats.reels.toString(), 
      icon: Video,
      color: 'bg-blue-700'
    },
    { 
      label: 'Total Vistas', 
      value: dashboardStats.views >= 1000 
        ? `${(dashboardStats.views / 1000).toFixed(1)}K` 
        : dashboardStats.views.toString(), 
      icon: Eye,
      color: 'bg-green-600'
    },
    { 
      label: 'Suscriptores', 
      value: dashboardStats.subscribers.toString(), 
      icon: Mail,
      color: 'bg-purple-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {viewsByCategory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vistas por Categoría</h2>
              <SimpleBarChart data={viewsByCategory} color="#1e3a8a" height={200} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Contenido</h2>
              <div className="space-y-4">
                {viewsByCategory.map((cat, idx) => {
                  const total = viewsByCategory.reduce((sum, c) => sum + c.value, 0);
                  const percent = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                  const colors = ['bg-blue-900', 'bg-green-600', 'bg-amber-500', 'bg-purple-600'];
                  return (
                    <div key={cat.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.label}</span>
                        <span className="text-gray-500">{cat.value.toLocaleString()} vistas ({percent}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Articles */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Artículos Recientes</h2>
              <Link 
                href="/admin/articulos"
                className="text-sm text-blue-900 hover:text-blue-700 font-medium"
              >
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                            {typeof article.category === 'string' ? article.category : article.category?.name || 'Sin categoría'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.created_at ? formatDistanceToNow(article.created_at) : 'Reciente'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {(article.views_count || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">vistas</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No hay artículos aún. ¡Crea el primero!
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/admin/articulos/nuevo"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-blue-900 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                    Nuevo Artículo
                  </p>
                  <p className="text-sm text-gray-500">Crear una nueva noticia</p>
                </div>
              </Link>

              <Link
                href="/admin/articulos/importar"
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    Importar JSON
                  </p>
                  <p className="text-sm text-gray-500">Importar artículos en lote</p>
                </div>
              </Link>

              <Link
                href="/admin/reels/nuevo"
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-blue-700 rounded-lg">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    Nuevo Reel
                  </p>
                  <p className="text-sm text-gray-500">Subir video corto</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
