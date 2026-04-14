import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type User } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }
    setForm(auth.user ?? {});
  }, [auth.isLoggedIn, auth.user, navigate]);

  if (!auth.isLoggedIn) return null;

  const patch = (k: keyof User, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Meu perfil</h1>
      <p className="text-gray-600 mb-8">
        Perfil: <strong>{auth.user?.profileType ?? '—'}</strong>
      </p>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-700">Nome</span>
          <input 
            value={form.name ?? ''} 
            onChange={(e) => patch('name', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-700">E-mail</span>
          <input 
            type="email"
            value={form.email ?? ''} 
            onChange={(e) => patch('email', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-700">Telefone</span>
          <input 
            value={form.phone ?? ''}
            onChange={(e) => patch('phone', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-gray-700">Endereço</span>
          <input 
            value={form.address ?? ''}
            onChange={(e) => patch('address', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <button
          type="button"
          className="px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity mt-4"
          onClick={() => auth.updateProfile(form)}
        >
          Salvar
        </button>

        <button 
          type="button"
          className="px-4 py-3 bg-white text-red-700 border-2 border-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors"
          onClick={() => auth.logout()}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
