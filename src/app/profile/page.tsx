'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type User } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Partial<User>>(auth.user ?? {});

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [auth.isLoggedIn, router]);

  if (!auth.isLoggedIn) return null;

  const patch = (k: keyof User, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl font-bold mb-4">Meu perfil</h1>
      <p className="mb-8">
        Perfil: <strong>{auth.user?.profileType ?? '—'}</strong>
      </p>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Nome</span>
          <input
            type="text"
            value={form.name ?? ''}
            onChange={(e) => patch('name', e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">E-mail</span>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => patch('email', e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Telefone</span>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={(e) => patch('phone', e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </label>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={() => auth.updateProfile(form)}
          className="px-5 py-2 btn-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => auth.logout().then(() => router.push('/login'))}
          className="px-5 py-2 btn-danger font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Sair
        </button>
      </div>
    </div>
  );
}