'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import { can } from '@/core/auth/permissions';
import { canAssignRole } from '@/core/auth/permissions';
import { hasRole, roleLabels, type AccessRoles } from '@/core/auth/roles';
import { useAuth } from '@/contexts/AuthContext';
import { getDomain } from '@/domains/catalog';
import {
  getCrudConfig,
  getValue,
  type CrudColumn,
  type CrudField,
} from '@/domains/crudConfig';
import type { CrudResource } from '@/core/auth/permissions';
import { filterPeopleForRole } from '@/domains/people/visibility';
import type { Person } from '@/domains/people/types';
import { DomainGuard } from './DomainGuard';

interface DomainWorkspaceProps {
  resource: CrudResource;
  /** @deprecated Columns and fields now come from the domain CRUD configuration. */
  entityFields?: string[];
}

type DialogMode = 'create' | 'view' | 'edit' | null;

export function DomainWorkspace({ resource }: DomainWorkspaceProps) {
  const domain = getDomain(resource);
  const config = getCrudConfig(resource);
  const { roles, user } = useAuth();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(config.defaults);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const canCreate = can(roles, resource, 'create');
  const canUpdate = can(roles, resource, 'update');
  const canDelete = can(roles, resource, 'delete');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiFetch<Record<string, unknown>[]>(`/${domain.apiResource}`)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os registros. Confirme se a API mock está rodando.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [domain.apiResource]);

  const rows = useMemo(() => {
    let visibleItems = config.filter ? items.filter(config.filter) : items;
    if (resource === 'people') {
      visibleItems = filterPeopleForRole(
        visibleItems as unknown as Person[],
        roles,
      ) as unknown as Record<string, unknown>[];
    }
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedSearch) return visibleItems;
    return visibleItems.filter((item) =>
      config.columns.some((column) =>
        String(getValue(item, column.path) ?? '')
          .toLocaleLowerCase('pt-BR')
          .includes(normalizedSearch),
      ),
    );
  }, [config, items, resource, roles, search]);

  const openCreate = () => {
    setSelected(null);
    setValues({ ...config.defaults });
    setFormErrors({});
    setDialogMode('create');
  };

  const openItem = (item: Record<string, unknown>, mode: 'view' | 'edit') => {
    setSelected(item);
    setValues({
      ...config.defaults,
      ...(config.toForm ? config.toForm(item) : item),
    });
    setFormErrors({});
    setDialogMode(mode);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogMode(null);
    setSelected(null);
    setFormErrors({});
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateValues(config.fields, values);

    if (
      resource === 'users' &&
      Array.isArray(values.roles) &&
      values.roles.includes('admin') &&
      !(Array.isArray(selected?.roles) && selected.roles.includes('admin')) &&
      !canAssignRole(roles, 'admin')
    ) {
      errors.roles = 'Somente um administrador pode atribuir o perfil Administrador.';
    }

    for (const uniqueField of uniqueFieldsForResource(resource)) {
      if (
        values[uniqueField] &&
        items.some(
          (item) =>
            item.id !== selected?.id &&
            normalizeUniqueValue(item[uniqueField]) === normalizeUniqueValue(values[uniqueField]),
        )
      ) {
        errors[uniqueField] = 'Já existe um registro com este valor.';
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const mapped = config.toPayload
        ? config.toPayload(values, selected ?? undefined)
        : withAudit(values, selected ?? undefined);
      const payload = dialogMode === 'create' ? mapped : { ...selected, ...mapped };
      const endpoint =
        dialogMode === 'create'
          ? `/${domain.apiResource}`
          : `/${domain.apiResource}/${String(selected?.id)}`;
      const saved = await apiFetch<Record<string, unknown>>(endpoint, {
        method: dialogMode === 'create' ? 'POST' : 'PUT',
        body: JSON.stringify(payload),
      });
      setItems((current) =>
        dialogMode === 'create'
          ? [...current, saved]
          : current.map((item) => (item.id === saved.id ? saved : item)),
      );
      setDialogMode(null);
      setSelected(null);
      setFormErrors({});
    } catch {
      setError(`Não foi possível salvar ${config.singular}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch<void>(`/${domain.apiResource}/${String(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError(`Não foi possível excluir ${config.singular}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DomainGuard resource={resource}>
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Domínio</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{domain.label}</h1>
            <p className="mt-2 max-w-2xl text-[var(--muted)]">{domain.description}</p>
          </div>
          {canCreate && (
            <button type="button" className="btn-primary" onClick={openCreate}>
              Novo cadastro
            </button>
          )}
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--muted)]">Seu perfil</p>
            <p className="text-lg font-semibold">{roleLabels(roles)}</p>
          </article>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--muted)]">Registros visíveis</p>
            <p className="text-lg font-semibold">{loading ? '…' : rows.length}</p>
          </article>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--muted)]">Escrita</p>
            <p className="text-lg font-semibold">{canCreate ? 'Permitida' : 'Somente leitura'}</p>
          </article>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] p-4">
            <label className="relative block max-w-md">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                search
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Buscar ${domain.label.toLocaleLowerCase('pt-BR')}...`}
                className="w-full pl-10"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--card-secondary)] text-[var(--muted)]">
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.path} className="px-4 py-3 font-medium">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={String(row.id ?? index)} className="border-t border-[var(--border)]">
                    {config.columns.map((column) => (
                      <td key={column.path} className="px-4 py-3">
                        {formatCell(row, column)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <ActionButton icon="visibility" label="Visualizar" onClick={() => openItem(row, 'view')} />
                        {canUpdate && (
                          <ActionButton icon="edit" label="Editar" onClick={() => openItem(row, 'edit')} />
                        )}
                        {canDelete && (
                          <ActionButton
                            icon="delete"
                            label="Excluir"
                            danger
                            disabled={resource === 'users' && row.id === user?.id}
                            onClick={() => setDeleteTarget(row)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-[var(--muted)]" colSpan={config.columns.length + 1}>
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {dialogMode && (
        <EntityDialog
          title={
            dialogMode === 'create'
              ? `Novo ${config.singular}`
              : dialogMode === 'edit'
                ? `Editar ${config.itemLabel(selected ?? {})}`
                : config.itemLabel(selected ?? {})
          }
          fields={config.fields}
          values={values}
          errors={formErrors}
          readOnly={dialogMode === 'view'}
          saving={saving}
          actorRoles={roles}
          currentItem={selected}
          onChange={(name, value) => {
            setValues((current) => ({ ...current, [name]: value }));
            setFormErrors((current) => ({ ...current, [name]: '' }));
          }}
          onClose={closeDialog}
          onSubmit={handleSave}
          onEdit={
            dialogMode === 'view' && canUpdate && selected
              ? () => openItem(selected, 'edit')
              : undefined
          }
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Excluir {config.singular}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Confirma a exclusão de <strong>{config.itemLabel(deleteTarget)}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-ghost" disabled={saving} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" disabled={saving} onClick={() => void handleDelete()}>
                {saving ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DomainGuard>
  );
}

interface EntityDialogProps {
  title: string;
  fields: CrudField[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  readOnly: boolean;
  saving: boolean;
  actorRoles: AccessRoles;
  currentItem: Record<string, unknown> | null;
  onChange: (name: string, value: unknown) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit?: () => void;
}

function EntityDialog({
  title,
  fields,
  values,
  errors,
  readOnly,
  saving,
  actorRoles,
  currentItem,
  onChange,
  onClose,
  onSubmit,
  onEdit,
}: EntityDialogProps) {
  const visibleFields = fields.filter((field) => !field.showWhen || field.showWhen(values));

  const handleFile = async (event: ChangeEvent<HTMLInputElement>, field: CrudField) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validExtension = /\.(xml|musicxml)$/i.test(file.name);
    if (!validExtension) {
      onChange(field.name, '');
      return;
    }
    const content = await file.text();
    const encoded = `data:${file.type || 'application/xml'};base64,${btoa(
      unescape(encodeURIComponent(content)),
    )}`;
    onChange(field.name, encoded);
    onChange('scoreFileName', file.name);
    onChange('scoreMimeType', file.type || 'application/xml');
  };

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Fechar">
            <span className="material-icons">close</span>
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            {visibleFields.map((field) => {
              const value = values[field.name];
              const roleOptions =
                field.name === 'roles' && !hasRole(actorRoles, 'admin')
                  ? field.options?.filter(
                      (option) =>
                        option.value !== 'admin' ||
                        (Array.isArray(currentItem?.roles) && currentItem.roles.includes('admin')),
                    )
                  : field.options;
              return (
                <div
                  key={field.name}
                  className={`flex flex-col gap-1.5 text-sm ${
                    field.type === 'textarea' || field.type === 'xml' ? 'md:col-span-2' : ''
                  }`}
                >
                  <span className="font-medium">
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                  </span>
                  {field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      disabled={readOnly}
                      className="h-5 w-5"
                      onChange={(event) => onChange(field.name, event.target.checked)}
                    />
                  ) : field.type === 'multiselect' ? (
                    <div className="grid gap-2 rounded-md border border-[var(--border)] p-3 sm:grid-cols-2">
                      {roleOptions?.map((option) => {
                        const selectedValues = Array.isArray(value) ? value.map(String) : [];
                        return (
                          <label key={option.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedValues.includes(option.value)}
                              disabled={readOnly}
                              onChange={(event) =>
                                onChange(
                                  field.name,
                                  event.target.checked
                                    ? [...selectedValues, option.value]
                                    : selectedValues.filter((item) => item !== option.value),
                                )
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      value={String(value ?? '')}
                      disabled={readOnly}
                      onChange={(event) => onChange(field.name, event.target.value)}
                    >
                      {roleOptions?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={String(value ?? '')}
                      readOnly={readOnly}
                      placeholder={field.placeholder}
                      onChange={(event) => onChange(field.name, event.target.value)}
                      className="rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2"
                    />
                  ) : field.type === 'xml' ? (
                    readOnly ? (
                      <p className="rounded-md bg-[var(--card-secondary)] px-3 py-2">
                        {String(values.scoreFileName || 'Nenhuma partitura anexada')}
                      </p>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept={field.accept}
                          onChange={(event) => void handleFile(event, field)}
                        />
                        {Boolean(values.scoreFileName) && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Atual: {String(values.scoreFileName)}
                          </p>
                        )}
                      </div>
                    )
                  ) : (
                    <input
                      type={field.type ?? 'text'}
                      value={String(value ?? '')}
                      readOnly={readOnly}
                      placeholder={field.placeholder}
                      step={field.type === 'number' ? '0.01' : undefined}
                      onChange={(event) =>
                        onChange(
                          field.name,
                          field.type === 'tel'
                            ? formatPhoneNumber(event.target.value)
                            : event.target.value,
                        )
                      }
                    />
                  )}
                  {field.helpText && <span className="text-xs text-[var(--muted)]">{field.helpText}</span>}
                  {errors[field.name] && <span className="text-xs text-red-600">{errors[field.name]}</span>}
                </div>
              );
            })}
          </div>
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--card)] px-6 py-4">
            <button type="button" className="btn-ghost" disabled={saving} onClick={onClose}>
              Fechar
            </button>
            {readOnly && onEdit ? (
              <button type="button" className="btn-primary" onClick={onEdit}>
                Editar
              </button>
            ) : !readOnly ? (
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={disabled ? 'Não é possível excluir o usuário da sessão.' : label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-[var(--color-brand-strong)] hover:bg-[var(--color-brand-soft)]'
      }`}
    >
      <span className="material-icons text-lg">{icon}</span>
    </button>
  );
}

function validateValues(fields: CrudField[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.showWhen && !field.showWhen(values)) continue;
    const value = values[field.name];
    if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
      errors[field.name] = `${field.label} é obrigatório.`;
      continue;
    }
    const customError = field.validate?.(value, values);
    if (customError) errors[field.name] = customError;
  }
  if (!values.isStudent && !values.isMusician && 'isStudent' in values) {
    errors.isStudent = 'Selecione ao menos Aluno ou Músico.';
  }
  return errors;
}

function uniqueFieldsForResource(resource: CrudResource): string[] {
  if (resource === 'users') return ['email'];
  if (resource === 'people') return ['email', 'document'];
  if (resource === 'media') return ['slug'];
  if (resource === 'patrimony' || resource === 'instruments') return ['code'];
  return [];
}

function normalizeUniqueValue(value: unknown): string {
  return String(value ?? '').trim().toLocaleLowerCase('pt-BR');
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function withAudit(
  values: Record<string, unknown>,
  current?: Record<string, unknown>,
): Record<string, unknown> {
  const now = new Date().toISOString();
  return { ...values, createdAt: current?.createdAt ?? now, updatedAt: now };
}

function formatCell(row: Record<string, unknown>, column: CrudColumn): string {
  const value = getValue(row, column.path);
  if (column.format === 'status') {
    const labels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      available: 'Disponível',
      in_use: 'Em uso',
      maintenance: 'Manutenção',
      retired: 'Baixado',
      draft: 'Rascunho',
      scheduled: 'Agendada',
      done: 'Realizada',
      cancelled: 'Cancelada',
      published: 'Publicado',
    };
    return labels[String(value)] ?? String(value ?? '—');
  }
  if (column.format === 'boolean') return value ? 'Sim' : 'Não';
  if (column.format === 'count') return String(Array.isArray(value) ? value.length : 0);
  if (column.format === 'currency') {
    return typeof value === 'number'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
      : '—';
  }
  if (column.format === 'date' || column.format === 'datetime') {
    if (!value) return '—';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return '—';
    return column.format === 'date'
      ? date.toLocaleDateString('pt-BR')
      : date.toLocaleString('pt-BR');
  }
  if (column.format === 'roles' && Array.isArray(value)) {
    return roleLabels(value as AccessRoles);
  }
  return value == null || value === '' ? '—' : String(value);
}
