import { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Admin - Evidente.mx',
  description: 'Panel de administración de Evidente.mx',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Evidente<span className="text-[#0067b2]">.mx</span>
          </h1>
          <p className="mt-2 text-gray-600">Panel de Administración</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>
          <AdminLoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Olvidaste tu contraseña?{' '}
          <a href="#" className="text-[#0067b2] hover:text-blue-700 font-medium">
            Recuperar acceso
          </a>
        </p>
      </div>
    </div>
  );
}
