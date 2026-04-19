'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type FieldType = 'text' | 'email' | 'tel' | 'date' | 'select' | 'file';

interface SelectOption {
  value: string;
  label: string;
}

export interface EntityFormField<TForm extends object> {
  name: keyof TForm & string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  readOnlyHint?: string;
  options?: SelectOption[];
  accept?: string;
  helpText?: string;
  colSpan?: 1 | 2;
  showWhen?: (formData: TForm) => boolean;
  validate?: (value: TForm[keyof TForm], formData: TForm) => string | null;
}

interface EntityFormPageProps<TForm extends object, TEntity = TForm> {
  resource: string;
  mode: 'create' | 'edit';
  id?: string;
  entityDisplayName: string;
  title: string;
  initialValues: TForm;
  fields: EntityFormField<TForm>[];
  saveLabel: string;
  savingLabel?: string;
  notFoundMessage?: string;
  getSuccessPath: (entity: TEntity) => string;
  mapLoadedToForm?: (entity: TEntity) => TForm;
  mapFormToPayload?: (formData: TForm) => unknown;
  renderNotice?: (formData: TForm) => React.ReactNode;
  validate?: (formData: TForm) => Record<string, string>;
}

type EntityFormStateSetter<TForm extends object> = React.Dispatch<React.SetStateAction<TForm>>;
type ErrorStateSetter = React.Dispatch<React.SetStateAction<Record<string, string>>>;

function getFieldInputClasses(isReadOnly: boolean, hasError: boolean): string {
  if (isReadOnly) {
    return 'bg-muted border-border cursor-not-allowed opacity-50';
  }

  return `bg-background ${hasError ? 'border-red-600' : 'border-border'}`;
}

function setFieldValue<TForm extends object>(
  setFormData: EntityFormStateSetter<TForm>,
  fieldName: keyof TForm & string,
  value: TForm[keyof TForm]
) {
  setFormData((previous) => ({
    ...previous,
    [fieldName]: value,
  }));
}

function clearFieldError(
  errors: Record<string, string>,
  setErrors: ErrorStateSetter,
  fieldName: string
) {
  if (!errors[fieldName]) {
    return;
  }

  setErrors((previous) => ({
    ...previous,
    [fieldName]: '',
  }));
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

function isFieldVisible<TForm extends object>(field: EntityFormField<TForm>, formData: TForm): boolean {
  return field.showWhen ? field.showWhen(formData) : true;
}

function formatPhoneNumber(value: string): string {
  const digits = value.replaceAll(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface FieldRendererProps<TForm extends object> {
  field: EntityFormField<TForm>;
  value: TForm[keyof TForm];
  hasError: boolean;
  errors: Record<string, string>;
  submitError: string | null;
  setFormData: EntityFormStateSetter<TForm>;
  setErrors: ErrorStateSetter;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof TForm & string) => Promise<void>;
}

function FieldRenderer<TForm extends object>({
  field,
  value,
  hasError,
  errors,
  submitError,
  setFormData,
  setErrors,
  setSubmitError,
  onInputChange,
  onFileChange,
}: Readonly<FieldRendererProps<TForm>>) {
  const isSelect = field.type === 'select';
  const isFile = field.type === 'file';
  const isReadOnly = Boolean(field.readOnly);
  const previewSrc = typeof value === 'string' ? value : '';
  const inputClasses = getFieldInputClasses(isReadOnly, hasError);

  if (isSelect) {
    return (
      <select
        id={field.name}
        name={field.name}
        value={value === undefined || value === null ? '' : String(value)}
        onChange={onInputChange}
        disabled={isReadOnly}
        className={`w-full px-3 py-2 border rounded-md text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${inputClasses}`}
      >
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (isFile) {
    return (
      <div className="space-y-3">
        <input
          type="file"
          id={field.name}
          name={field.name}
          accept={field.accept || 'image/*'}
          onChange={(event) => void onFileChange(event, field.name)}
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border rounded-md text-card-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white ${inputClasses}`}
        />

        {previewSrc ? (
          <div className="flex items-center gap-4 rounded-lg border border-border bg-background px-4 py-3">
            <Image
              src={previewSrc}
              alt="Pré-visualização da foto de perfil"
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover border border-border"
              unoptimized
            />
            <button
              type="button"
              onClick={() => {
                setFieldValue(setFormData, field.name, '' as TForm[keyof TForm]);
                clearFieldError(errors, setErrors, field.name);
                if (submitError) {
                  setSubmitError(null);
                }
              }}
              className="btn-ghost"
            >
              Remover imagem
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <input
      type={field.type || 'text'}
      id={field.name}
      name={field.name}
      value={value === undefined || value === null ? '' : String(value)}
      onChange={onInputChange}
      placeholder={field.placeholder}
      disabled={isReadOnly}
      className={`w-full px-3 py-2 border rounded-md text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary ${inputClasses}`}
    />
  );
}

export function EntityFormPage<TForm extends object, TEntity = TForm>({
  resource,
  mode,
  id,
  entityDisplayName,
  title,
  initialValues,
  fields,
  saveLabel,
  savingLabel = 'Salvando...',
  notFoundMessage,
  getSuccessPath,
  mapLoadedToForm,
  mapFormToPayload,
  renderNotice,
  validate,
}: Readonly<EntityFormPageProps<TForm, TEntity>>) {
  const router = useRouter();
  const [formData, setFormData] = useState<TForm>(initialValues);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const visibleFields = fields.filter((field) => isFieldVisible(field, formData));

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      return;
    }

    const loadEntity = async () => {
      try {
        const entity = await apiFetch<TEntity>(`/${resource}/${id}`);
        setFormData(mapLoadedToForm ? mapLoadedToForm(entity) : (entity as unknown as TForm));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [id, mapLoadedToForm, mode, resource]);

  const validateForm = (): boolean => {
    const fieldErrors: Record<string, string> = {};

    visibleFields.forEach((field) => {
      const value = formData[field.name];

      const isMissingRequiredValue = typeof value === 'string'
        ? !value.trim()
        : value === undefined || value === null || value === '';

      if (field.required && isMissingRequiredValue) {
        fieldErrors[field.name] = `${field.label} é obrigatório`;
      }

      if (field.validate) {
        const validationError = field.validate(value, formData);
        if (validationError) {
          fieldErrors[field.name] = validationError;
        }
      }
    });

    const customErrors = validate ? validate(formData) : {};
    const mergedErrors = { ...fieldErrors, ...customErrors };
    setErrors(mergedErrors);
    return Object.keys(mergedErrors).length === 0;
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const name = event.target.name as keyof TForm & string;
    const rawValue = event.target.value;
    const field = fields.find((candidate) => candidate.name === name);
    const value = field?.type === 'tel' ? formatPhoneNumber(rawValue) : rawValue;

    setFieldValue(setFormData, name, value as TForm[keyof TForm]);
    clearFieldError(errors, setErrors, name);

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof TForm & string
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFieldValue(setFormData, fieldName, '' as TForm[keyof TForm]);
      clearFieldError(errors, setErrors, fieldName);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: 'Selecione um arquivo de imagem válido.',
      }));
      return;
    }

    const fileAsDataUrl = await readFileAsDataUrl(file).catch(() => '');

    if (!fileAsDataUrl) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: 'Não foi possível processar a imagem selecionada.',
      }));
      return;
    }

    setFieldValue(setFormData, fieldName, fileAsDataUrl as TForm[keyof TForm]);
    clearFieldError(errors, setErrors, fieldName);

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (mode === 'edit' && !id) {
      setSubmitError(`ID de ${entityDisplayName.toLowerCase()} inválido.`);
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      const endpoint = mode === 'edit' ? `/${resource}/${id}` : `/${resource}`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const payload = mapFormToPayload ? mapFormToPayload(formData) : formData;

      const entity = await apiFetch<TEntity>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      router.push(getSuccessPath(entity));
    } catch {
      setSubmitError(`Erro ao salvar ${entityDisplayName.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
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
        <h1 className="text-3xl font-bold text-card-foreground">{title}</h1>
        <div />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden p-6">
        <form onSubmit={(event) => { event.preventDefault(); handleSave(); }} className="space-y-6">
          {renderNotice ? renderNotice(formData) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleFields.map((field) => {
              const value = formData[field.name];
              const hasError = Boolean(errors[field.name]);

              return (
                <div key={field.name} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                  <label htmlFor={field.name} className="text-sm font-semibold text-card-foreground block mb-2">
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                    {field.readOnlyHint && <span className="text-muted"> {field.readOnlyHint}</span>}
                  </label>

                  <FieldRenderer
                    field={field}
                    value={value}
                    hasError={hasError}
                    errors={errors}
                    submitError={submitError}
                    setFormData={setFormData}
                    setErrors={setErrors}
                    setSubmitError={setSubmitError}
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                  />

                  {field.helpText && !hasError && <p className="text-muted text-sm mt-1">{field.helpText}</p>}
                  {hasError && <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>}
                </div>
              );
            })}
          </div>
        </form>
      </div>

      {submitError && <p className="text-red-600 text-sm mt-4">{submitError}</p>}

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? savingLabel : saveLabel}
        </button>
        <button
          onClick={() => router.back()}
          disabled={saving}
          className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}