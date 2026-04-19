'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface EntityDetailField<TEntity> {
  label: string;
  render: (entity: TEntity) => React.ReactNode;
  colSpan?: 1 | 2;
}

interface EntityDetailPageProps<TEntity> {
  resource: string;
  id: string;
  entityDisplayName: string;
  notFoundMessage?: string;
  getTitle: (entity: TEntity) => string;
  badge?: (entity: TEntity) => React.ReactNode;
  fields: EntityDetailField<TEntity>[];
  editPath?: (entity: TEntity) => string;
  editLabel?: string;
}

export function EntityDetailPage<TEntity>({
  resource,
  id,
  entityDisplayName,
  notFoundMessage,
  getTitle,
  badge,
  fields,
  editPath,
  editLabel = 'Editar',
}: EntityDetailPageProps<TEntity>) {
  const router = useRouter();
  const [entity, setEntity] = useState<TEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntity = async () => {
      try {
        const data = await apiFetch<TEntity>(`/${resource}/${id}`);
        setEntity(data);
      } catch {
        setEntity(null);
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [id, resource]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{notFoundMessage || `${entityDisplayName} não encontrado(a).`}</p>
          <button onClick={() => router.back()} className="btn-primary">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-primary hover:underline flex items-center gap-1">
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold text-card-foreground">{getTitle(entity)}</h1>
        <div />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {badge && (
          <div className="bg-gradient-to-r from-card to-card-secondary p-6 border-b border-border">
            {badge(entity)}
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={`${field.label}-${index}`} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                <label className="text-sm font-semibold text-muted mb-2 block">{field.label}</label>
                <div className="text-card-foreground">{field.render(entity)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {editPath && (
          <button onClick={() => router.push(editPath(entity))} className="btn-secondary">
            {editLabel}
          </button>
        )}
        <button onClick={() => router.back()} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </div>
  );
}