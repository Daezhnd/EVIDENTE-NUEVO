'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'inline' | 'card';
  className?: string;
}

export function NewsletterForm({ variant = 'card', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor ingresa un email válido');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Gracias! Te has suscrito exitosamente.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Ocurrió un error. Intenta de nuevo.');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión. Intenta de nuevo.');
    }
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={status === 'loading' || status === 'success'}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evident focus:border-transparent disabled:bg-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="px-4 py-2 bg-evident text-white text-sm font-medium rounded-lg hover:bg-evident-dark transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suscribir'}
        </button>
      </form>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-evident to-evident-dark rounded-2xl p-6 md:p-8 text-white ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Newsletter</h3>
          <p className="text-blue-200 text-sm">Recibe las noticias en tu correo</p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-300" />
          <span className="text-green-100">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="tu@email.com"
              disabled={status === 'loading'}
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 disabled:bg-gray-100"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-white text-cyan-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Suscribiendo...
              </>
            ) : (
              'Suscribirme gratis'
            )}
          </button>

          <p className="text-xs text-cyan-200 text-center">
            Sin spam. Cancela cuando quieras.
          </p>
        </form>
      )}
    </div>
  );
}
