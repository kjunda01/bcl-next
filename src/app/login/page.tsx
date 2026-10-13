'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTHENTICATED_ROLES, ROLE_LABEL } from '@/core/auth/roles';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@bcl.local');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goIn = () => router.push('/gestao');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await auth.login(email, password, keep);
      goIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Acesso interno</p>
        <h1 className="mt-2 text-3xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Administrador e maestro entram com e-mail e senha. Aluno e músico podem usar o acesso rápido.
        </p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1.5 text-sm">
            E-mail
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Senha
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
            Manter conectado
          </label>
          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
          <button type="submit" className="btn-primary min-h-11">
            Entrar
          </button>
        </form>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Acesso rápido</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {AUTHENTICATED_ROLES.filter((role) => role !== 'admin' && role !== 'maestro').map((role) => (
              <button
                key={role}
                type="button"
                className="btn-outline-primary min-h-11 text-sm"
                onClick={() => auth.loginAs(role, keep).then(goIn)}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
