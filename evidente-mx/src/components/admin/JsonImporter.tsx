'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';
import { ArticleCategory } from '@/types/database';
import {
  Upload,
  FileJson,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Copy,
  Download
} from 'lucide-react';

interface ImportedArticle {
  title: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  image?: string;
  category?: string;
  categoria?: string;
  is_published?: boolean;
  published?: boolean;
}

interface ProcessedArticle {
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string | null;
  category: ArticleCategory;
  is_published: boolean;
  published_at: string | null;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

// const validCategories: ArticleCategory[] = ['Destacadas', 'Noticias', 'Deportes', 'Turismo'];

// Función para convertir texto plano a HTML con párrafos
const formatContentToHtml = (content: string): string => {
  if (!content) return '';

  // Si ya tiene tags HTML, devolverlo como está
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  // Dividir por dobles saltos de línea (párrafos)
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Si solo hay un párrafo sin saltos, intentar dividir por saltos simples
  if (paragraphs.length === 1 && content.includes('\n')) {
    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    return lines.map(line => `<p>${line}</p>`).join('\n');
  }

  // Envolver cada párrafo en <p>
  return paragraphs.map(p => {
    // Si el párrafo tiene saltos de línea simples, convertirlos a <br>
    const withBreaks = p.replace(/\n/g, '<br>');
    return `<p>${withBreaks}</p>`;
  }).join('\n');
};

const exampleJson = `[
  {
    "title": "Título de la noticia",
    "summary": "Resumen breve de la noticia",
    "content": "Primer párrafo del artículo con información importante.\\n\\nSegundo párrafo con más detalles sobre la noticia.\\n\\nTercer párrafo con conclusiones.",
    "image_url": "https://ejemplo.com/imagen.jpg",
    "category": "Noticias",
    "is_published": true
  },
  {
    "title": "Segunda noticia",
    "summary": "Otro resumen",
    "content": "<p>También puedes usar HTML directamente.</p><p>Cada párrafo en su tag.</p>",
    "category": "Deportes"
  }
]`;

export function JsonImporter() {
  // const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [processedArticles, setProcessedArticles] = useState<ProcessedArticle[]>([]);
  // const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const normalizeCategory = (cat?: string): ArticleCategory => {
    if (!cat) return 'Noticias';
    const normalized = cat.toLowerCase().trim();

    // Destacadas
    if (normalized.includes('destacad') || normalized.includes('principal') || normalized.includes('portada')) {
      return 'Destacadas';
    }

    // Internacionales
    if (normalized.includes('internacional') || normalized.includes('mundo') || normalized.includes('global')) {
      return 'Internacionales';
    }

    // Entretenimiento
    if (normalized.includes('entretenimiento') || normalized.includes('espectaculo') || normalized.includes('espectáculo') || normalized.includes('cultura') || normalized.includes('celebridad')) {
      return 'Entretenimiento';
    }

    // Deportes
    if (normalized.includes('deport') || normalized.includes('futbol') || normalized.includes('fútbol')) {
      return 'Deportes';
    }

    // Turismo
    if (normalized.includes('turis') || normalized.includes('viaj') || normalized.includes('destino')) {
      return 'Turismo';
    }

    // Todo lo demás va a Noticias (política, economía, local, etc.)
    // Noticias es la categoría general
    return 'Noticias';
  };

  const processJson = () => {
    setParseError(null);
    setProcessedArticles([]);

    if (!jsonInput.trim()) {
      setParseError('Por favor, pega el JSON a importar');
      return;
    }

    try {
      let parsed = JSON.parse(jsonInput);

      // Si no es un array, intenta envolverlo
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      const processed: ProcessedArticle[] = parsed.map((item: ImportedArticle, index: number) => {
        // Validar que tenga título
        if (!item.title || typeof item.title !== 'string') {
          return {
            title: `Artículo ${index + 1} (sin título)`,
            slug: '',
            summary: '',
            content: '',
            image_url: null,
            category: 'Noticias' as ArticleCategory,
            is_published: false,
            published_at: null,
            status: 'error' as const,
            error: 'El artículo debe tener un título',
          };
        }

        return {
          title: item.title.trim(),
          slug: generateSlug(item.title),
          summary: (item.summary || item.excerpt || '').trim(),
          content: formatContentToHtml((item.content || '').trim()),
          image_url: item.image_url || item.image || null,
          category: normalizeCategory(item.category || item.categoria),
          is_published: item.is_published ?? item.published ?? true,
          published_at: new Date().toISOString(),
          status: 'pending' as const,
        };
      });

      setProcessedArticles(processed);
    } catch (e) {
      setParseError(`Error al parsear JSON: ${e instanceof Error ? e.message : 'Formato inválido'}`);
    }
  };

  const importArticles = async () => {
    if (processedArticles.length === 0) return;

    setIsImporting(true);
    const supabase = createClient();
    let success = 0;
    let failed = 0;

    const updatedArticles = [...processedArticles];

    for (let i = 0; i < updatedArticles.length; i++) {
      const article = updatedArticles[i];

      if (article.status === 'error') {
        failed++;
        continue;
      }

      try {
        // Verificar si el slug ya existe y generar uno único si es necesario
        let finalSlug = article.slug;
        const { data: existingArticle } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', finalSlug)
          .single();

        if (existingArticle) {
          // El slug ya existe, agregar un sufijo con timestamp
          const timestamp = Date.now().toString(36); // Base36 para un sufijo más corto
          finalSlug = `${article.slug}-${timestamp}`;
        }

        const insertData = {
          title: article.title,
          slug: finalSlug,
          summary: article.summary,
          content: article.content,
          image_url: article.image_url,
          category: article.category,
          is_published: article.is_published,
          published_at: article.is_published ? article.published_at : null,
        };

        const { error } = await supabase.from('articles').insert([insertData]).select();

        if (error) throw error;

        updatedArticles[i] = { ...article, slug: finalSlug, status: 'success' };
        success++;
      } catch (e) {
        console.error('Error detallado:', e);
        const errorObj = e as { message?: string; details?: string; hint?: string; code?: string };
        const errorMsg = errorObj.message || 'Error desconocido';
        const hint = errorObj.hint ? ` - ${errorObj.hint}` : '';
        const code = errorObj.code ? ` [${errorObj.code}]` : '';

        updatedArticles[i] = {
          ...article,
          status: 'error',
          error: `${errorMsg}${hint}${code}`
        };
        failed++;
      }

      setProcessedArticles([...updatedArticles]);
    }

    setImportResults({ success, failed });
    setIsImporting(false);
  };

  const copyExample = () => {
    navigator.clipboard.writeText(exampleJson);
  };

  const clearAll = () => {
    setJsonInput('');
    setProcessedArticles([]);
    setImportResults(null);
    setParseError(null);
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/articulos"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a artículos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-[#0067b2]" />
              JSON de Entrada
            </h2>
            <button
              onClick={copyExample}
              className="text-sm text-[#0067b2] hover:text-[#00528e] flex items-center gap-1"
              title="Copiar ejemplo"
            >
              <Copy className="w-4 h-4" />
              Ver ejemplo
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Pega tu JSON aquí...\n\nEjemplo:\n${exampleJson}`}
            className="w-full h-80 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0067b2] focus:border-transparent font-mono text-sm resize-none"
          />

          {parseError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {parseError}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={processJson}
              disabled={!jsonInput.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0067b2] hover:bg-[#00528e] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              Procesar JSON
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>

          {/* Format hints */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Campos soportados:</h3>
            <ul className="text-xs text-gray-500 space-y-1">
              <li><code className="bg-gray-200 px-1 rounded">title</code> - Título (requerido)</li>
              <li><code className="bg-gray-200 px-1 rounded">summary</code> o <code className="bg-gray-200 px-1 rounded">excerpt</code> - Resumen</li>
              <li><code className="bg-gray-200 px-1 rounded">content</code> - Contenido HTML</li>
              <li><code className="bg-gray-200 px-1 rounded">image_url</code> o <code className="bg-gray-200 px-1 rounded">image</code> - URL de imagen</li>
              <li><code className="bg-gray-200 px-1 rounded">category</code> o <code className="bg-gray-200 px-1 rounded">categoria</code> - Categoría</li>
              <li><code className="bg-gray-200 px-1 rounded">is_published</code> - Publicar automáticamente</li>
            </ul>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Vista Previa ({processedArticles.length} artículos)
          </h2>

          {processedArticles.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-gray-400">
              <FileJson className="w-12 h-12 mb-2 opacity-50" />
              <p>Procesa el JSON para ver la vista previa</p>
            </div>
          ) : (
            <>
              <div className="h-80 overflow-y-auto space-y-3 pr-2">
                {processedArticles.map((article, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${article.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : article.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {article.category}
                          </span>
                          {article.is_published && (
                            <span className="text-xs text-green-600">Publicar</span>
                          )}
                        </div>
                        {article.error && (
                          <p className="text-xs text-red-600 mt-1">{article.error}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {article.status === 'success' && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                        {article.status === 'error' && (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        {article.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {importResults ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="text-green-600 font-medium">{importResults.success} exitosos</span>
                      {importResults.failed > 0 && (
                        <span className="text-red-600 font-medium"> · {importResults.failed} fallidos</span>
                      )}
                    </p>
                    <Link
                      href="/admin/articulos"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0067b2] text-white rounded-lg hover:bg-[#00528e] transition-colors"
                    >
                      Ver artículos
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={importArticles}
                    disabled={isImporting || processedArticles.every(a => a.status === 'error')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Importar {processedArticles.filter(a => a.status === 'pending').length} artículos
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
