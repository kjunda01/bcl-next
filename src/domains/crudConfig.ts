import type { Resource } from '@/core/auth/permissions';
import { isPersonUnderage } from '@/domains/people/types';

export type CrudFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'xml';

export interface CrudOption {
  value: string;
  label: string;
}

export interface CrudField {
  name: string;
  label: string;
  type?: CrudFieldType;
  required?: boolean;
  options?: CrudOption[];
  placeholder?: string;
  helpText?: string;
  accept?: string;
  showWhen?: (values: Record<string, unknown>) => boolean;
  validate?: (value: unknown, values: Record<string, unknown>) => string | null;
}

export interface CrudColumn {
  path: string;
  label: string;
  format?: 'boolean' | 'date' | 'datetime' | 'currency' | 'count' | 'roles' | 'status';
}

export interface DomainCrudConfig {
  resource: Exclude<Resource, 'portal'>;
  singular: string;
  fields: CrudField[];
  columns: CrudColumn[];
  defaults: Record<string, unknown>;
  itemLabel: (item: Record<string, unknown>) => string;
  filter?: (item: Record<string, unknown>) => boolean;
  toForm?: (item: Record<string, unknown>) => Record<string, unknown>;
  toPayload?: (
    values: Record<string, unknown>,
    current?: Record<string, unknown>,
  ) => Record<string, unknown>;
}

const requiredProfile = (value: unknown, values: Record<string, unknown>, enabled: string) =>
  values[enabled] && !value ? 'Campo obrigatório para este perfil.' : null;

const isUnderageStudent = (values: Record<string, unknown>) =>
  Boolean(values.isStudent) &&
  Boolean(values.birthDate) &&
  isPersonUnderage(String(values.birthDate));

const requiredForUnderageStudent = (value: unknown, values: Record<string, unknown>) =>
  isUnderageStudent(values) && !String(value ?? '').trim()
    ? 'Campo obrigatório para aluno menor de idade.'
    : null;

const validatePhone = (value: unknown) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11
    ? null
    : 'Informe um telefone com DDD.';
};

const commonStatus: CrudField = {
  name: 'status',
  label: 'Status',
  type: 'select',
  required: true,
  options: [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ],
};

const users: DomainCrudConfig = {
  resource: 'users',
  singular: 'usuário',
  defaults: { name: '', email: '', roles: ['aluno'], isActive: true, personId: '' },
  fields: [
    { name: 'name', label: 'Nome', required: true },
    { name: 'email', label: 'E-mail', type: 'email', required: true },
    {
      name: 'roles',
      label: 'Perfis',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'aluno', label: 'Aluno' },
        { value: 'musico', label: 'Músico' },
        { value: 'maestro', label: 'Maestro' },
        { value: 'admin', label: 'Administrador' },
      ],
    },
    { name: 'personId', label: 'ID da pessoa vinculada', helpText: 'Opcional.' },
    { name: 'isActive', label: 'Usuário ativo', type: 'checkbox' },
  ],
  columns: [
    { path: 'name', label: 'Nome' },
    { path: 'email', label: 'E-mail' },
    { path: 'roles', label: 'Perfis', format: 'roles' },
    { path: 'isActive', label: 'Ativo', format: 'boolean' },
    { path: 'personId', label: 'Pessoa' },
  ],
  itemLabel: (item) => String(item.name ?? item.email ?? 'Usuário'),
  toForm: (item) => ({
    ...item,
    roles: Array.isArray(item.roles) ? item.roles : [],
  }),
  toPayload: withAudit,
};

const people: DomainCrudConfig = {
  resource: 'people',
  singular: 'pessoa',
  defaults: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    photoUrl: '',
    document: '',
    isStudent: true,
    isMusician: false,
    'student.enrollmentDate': '',
    'student.guardianName': '',
    'student.guardianPhone': '',
    'student.guardianRelationship': '',
    'musician.joinedAt': '',
    'musician.section': '',
    'musician.instrumentIds': '',
    status: 'active',
  },
  fields: [
    { name: 'firstName', label: 'Nome', required: true },
    { name: 'lastName', label: 'Sobrenome', required: true },
    { name: 'email', label: 'E-mail', type: 'email', required: true },
    {
      name: 'phone',
      label: 'Telefone',
      type: 'tel',
      required: true,
      placeholder: '(00) 00000-0000',
      validate: validatePhone,
    },
    {
      name: 'birthDate',
      label: 'Data de nascimento',
      type: 'date',
      required: true,
      validate: (value) => {
        const date = new Date(`${String(value)}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date <= new Date()
          ? null
          : 'Informe uma data de nascimento válida.';
      },
    },
    { name: 'photoUrl', label: 'URL da foto', placeholder: 'https://…' },
    { name: 'document', label: 'Documento' },
    { name: 'address', label: 'Endereço' },
    { name: 'isStudent', label: 'É aluno', type: 'checkbox' },
    { name: 'isMusician', label: 'É músico', type: 'checkbox' },
    {
      name: 'student.enrollmentDate',
      label: 'Data de matrícula',
      type: 'date',
      showWhen: (values) => Boolean(values.isStudent),
      validate: (value, values) => requiredProfile(value, values, 'isStudent'),
    },
    {
      name: 'student.guardianName',
      label: 'Responsável',
      showWhen: (values) => Boolean(values.isStudent),
      validate: requiredForUnderageStudent,
    },
    {
      name: 'student.guardianPhone',
      label: 'Telefone do responsável',
      type: 'tel',
      showWhen: (values) => Boolean(values.isStudent),
      validate: (value, values) =>
        requiredForUnderageStudent(value, values) ?? (value ? validatePhone(value) : null),
    },
    {
      name: 'student.guardianRelationship',
      label: 'Parentesco',
      type: 'select',
      showWhen: (values) => Boolean(values.isStudent),
      validate: requiredForUnderageStudent,
      options: [
        { value: '', label: 'Não informado' },
        { value: 'pai', label: 'Pai' },
        { value: 'mae', label: 'Mãe' },
        { value: 'irmao', label: 'Irmão' },
        { value: 'tutor_legal', label: 'Tutor legal' },
      ],
    },
    {
      name: 'musician.joinedAt',
      label: 'Entrada na banda',
      type: 'date',
      showWhen: (values) => Boolean(values.isMusician),
      validate: (value, values) => requiredProfile(value, values, 'isMusician'),
    },
    {
      name: 'musician.section',
      label: 'Naipe',
      showWhen: (values) => Boolean(values.isMusician),
      placeholder: 'Ex.: Metais',
    },
    {
      name: 'musician.instrumentIds',
      label: 'IDs dos instrumentos',
      showWhen: (values) => Boolean(values.isMusician),
      helpText: 'Separe os IDs por vírgula.',
    },
    commonStatus,
  ],
  columns: [
    { path: 'firstName', label: 'Nome' },
    { path: 'lastName', label: 'Sobrenome' },
    { path: 'email', label: 'E-mail' },
    { path: 'phone', label: 'Telefone' },
    { path: 'isStudent', label: 'Aluno', format: 'boolean' },
    { path: 'isMusician', label: 'Músico', format: 'boolean' },
    { path: 'status', label: 'Status', format: 'status' },
  ],
  itemLabel: (item) => `${String(item.firstName ?? '')} ${String(item.lastName ?? '')}`.trim(),
  toForm: flattenEntity,
  toPayload: (values, current) => {
    const payload = unflattenEntity(values);
    if (!values.isStudent) delete payload.student;
    if (!values.isMusician) delete payload.musician;
    const musician = payload.musician as Record<string, unknown> | undefined;
    if (musician && typeof musician.instrumentIds === 'string') {
      musician.instrumentIds = musician.instrumentIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }
    return withAudit(payload, current);
  },
};

const songs: DomainCrudConfig = {
  resource: 'songs',
  singular: 'música',
  defaults: {
    title: '',
    composer: '',
    arranger: '',
    genre: '',
    key: '',
    durationSeconds: '',
    scoreFile: '',
    scoreFileName: '',
    scoreMimeType: '',
    status: 'active',
  },
  fields: [
    { name: 'title', label: 'Título', required: true },
    { name: 'composer', label: 'Compositor', required: true },
    { name: 'arranger', label: 'Arranjador' },
    { name: 'genre', label: 'Gênero' },
    { name: 'key', label: 'Tonalidade', placeholder: 'Ex.: Bb' },
    { name: 'durationSeconds', label: 'Duração (segundos)', type: 'number' },
    {
      name: 'scoreFile',
      label: 'Partitura MusicXML',
      type: 'xml',
      accept: '.xml,.musicxml,application/xml,text/xml,application/vnd.recordare.musicxml+xml',
      helpText: 'Arquivos .xml ou .musicxml. Ao editar, deixe vazio para manter a partitura atual.',
    },
    commonStatus,
  ],
  columns: [
    { path: 'title', label: 'Título' },
    { path: 'composer', label: 'Compositor' },
    { path: 'arranger', label: 'Arranjador' },
    { path: 'genre', label: 'Gênero' },
    { path: 'key', label: 'Tonalidade' },
    { path: 'scores', label: 'Partituras', format: 'count' },
    { path: 'status', label: 'Status', format: 'status' },
  ],
  itemLabel: (item) => String(item.title ?? 'Música'),
  toForm: (item) => {
    const score = Array.isArray(item.scores)
      ? (item.scores[0] as Record<string, unknown> | undefined)
      : undefined;
    return {
      ...item,
      scoreFile: '',
      scoreFileName: score?.fileName ?? '',
      scoreMimeType: score?.mimeType ?? '',
    };
  },
  toPayload: (values, current) => {
    const {
      scoreFile,
      scoreFileName,
      scoreMimeType,
      durationSeconds,
      ...base
    } = values;
    const previousScores = current?.scores;
    const scores = scoreFile
      ? [
          {
            fileName: scoreFileName || 'partitura.musicxml',
            mimeType: scoreMimeType || 'application/xml',
            url: scoreFile,
          },
        ]
      : Array.isArray(previousScores)
        ? previousScores
        : [];
    return withAudit(
      {
        ...base,
        durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
        scores,
      },
      current,
    );
  },
};

const patrimony: DomainCrudConfig = {
  resource: 'patrimony',
  singular: 'item de patrimônio',
  defaults: {
    code: '',
    name: '',
    category: 'equipment',
    acquisitionDate: '',
    acquisitionValue: '',
    status: 'available',
    location: '',
    notes: '',
    assignedPersonId: '',
  },
  fields: [
    { name: 'code', label: 'Código', required: true },
    { name: 'name', label: 'Nome', required: true },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select',
      required: true,
      options: [
        { value: 'instrument', label: 'Instrumento' },
        { value: 'uniform', label: 'Uniforme' },
        { value: 'equipment', label: 'Equipamento' },
        { value: 'furniture', label: 'Mobiliário' },
        { value: 'other', label: 'Outro' },
      ],
    },
    { name: 'acquisitionDate', label: 'Data de aquisição', type: 'date', required: true },
    { name: 'acquisitionValue', label: 'Valor de aquisição', type: 'number' },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'available', label: 'Disponível' },
        { value: 'in_use', label: 'Em uso' },
        { value: 'maintenance', label: 'Manutenção' },
        { value: 'retired', label: 'Baixado' },
      ],
    },
    { name: 'location', label: 'Localização' },
    { name: 'assignedPersonId', label: 'ID do responsável' },
    { name: 'notes', label: 'Observações', type: 'textarea' },
  ],
  columns: [
    { path: 'code', label: 'Código' },
    { path: 'name', label: 'Nome' },
    { path: 'category', label: 'Categoria' },
    { path: 'status', label: 'Estado', format: 'status' },
    { path: 'location', label: 'Localização' },
    { path: 'acquisitionValue', label: 'Valor', format: 'currency' },
  ],
  itemLabel: (item) => String(item.name ?? item.code ?? 'Patrimônio'),
  toPayload: (values, current) =>
    withAudit(
      {
        ...values,
        acquisitionValue: values.acquisitionValue ? Number(values.acquisitionValue) : undefined,
      },
      current,
    ),
};

const instruments: DomainCrudConfig = {
  resource: 'instruments',
  singular: 'instrumento',
  defaults: {
    code: '',
    name: '',
    acquisitionDate: '',
    acquisitionValue: '',
    status: 'available',
    location: '',
    assignedPersonId: '',
    'instrument.family': 'woodwind',
    'instrument.pitch': '',
    'instrument.serialNumber': '',
    'instrument.manufacturer': '',
    'instrument.model': '',
  },
  fields: [
    { name: 'code', label: 'Código patrimonial', required: true },
    { name: 'name', label: 'Nome', required: true },
    {
      name: 'instrument.family',
      label: 'Família',
      type: 'select',
      required: true,
      options: [
        { value: 'woodwind', label: 'Madeiras' },
        { value: 'brass', label: 'Metais' },
        { value: 'percussion', label: 'Percussão' },
        { value: 'string', label: 'Cordas' },
        { value: 'keyboard', label: 'Teclas' },
      ],
    },
    { name: 'instrument.pitch', label: 'Afinação', placeholder: 'Ex.: Bb' },
    { name: 'instrument.manufacturer', label: 'Fabricante' },
    { name: 'instrument.model', label: 'Modelo' },
    { name: 'instrument.serialNumber', label: 'Número de série' },
    { name: 'acquisitionDate', label: 'Data de aquisição', type: 'date', required: true },
    { name: 'acquisitionValue', label: 'Valor de aquisição', type: 'number' },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: patrimony.fields.find((field) => field.name === 'status')?.options,
    },
    { name: 'location', label: 'Localização' },
    { name: 'assignedPersonId', label: 'ID do músico responsável' },
  ],
  columns: [
    { path: 'code', label: 'Código' },
    { path: 'name', label: 'Instrumento' },
    { path: 'instrument.family', label: 'Família' },
    { path: 'instrument.pitch', label: 'Afinação' },
    { path: 'instrument.manufacturer', label: 'Fabricante' },
    { path: 'status', label: 'Estado', format: 'status' },
  ],
  itemLabel: (item) => String(item.name ?? item.code ?? 'Instrumento'),
  filter: (item) => item.category === 'instrument',
  toForm: flattenEntity,
  toPayload: (values, current) => {
    const payload = unflattenEntity(values);
    payload.category = 'instrument';
    payload.acquisitionValue = values.acquisitionValue
      ? Number(values.acquisitionValue)
      : undefined;
    return withAudit(payload, current);
  },
};

const presentations: DomainCrudConfig = {
  resource: 'presentations',
  singular: 'apresentação',
  defaults: {
    title: '',
    venue: '',
    startsAt: '',
    endsAt: '',
    description: '',
    repertoireIds: '',
    coverUrl: '',
    isPublic: true,
    status: 'draft',
  },
  fields: [
    { name: 'title', label: 'Título', required: true },
    { name: 'venue', label: 'Local', required: true },
    { name: 'startsAt', label: 'Início', type: 'datetime-local', required: true },
    { name: 'endsAt', label: 'Fim', type: 'datetime-local' },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    {
      name: 'repertoireIds',
      label: 'IDs das músicas',
      helpText: 'Separe os IDs por vírgula.',
    },
    { name: 'coverUrl', label: 'URL da capa' },
    { name: 'isPublic', label: 'Mostrar na agenda pública', type: 'checkbox' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Rascunho' },
        { value: 'scheduled', label: 'Agendada' },
        { value: 'done', label: 'Realizada' },
        { value: 'cancelled', label: 'Cancelada' },
      ],
    },
  ],
  columns: [
    { path: 'title', label: 'Título' },
    { path: 'venue', label: 'Local' },
    { path: 'startsAt', label: 'Data', format: 'datetime' },
    { path: 'isPublic', label: 'Pública', format: 'boolean' },
    { path: 'status', label: 'Status', format: 'status' },
    { path: 'repertoireIds', label: 'Repertório', format: 'count' },
  ],
  itemLabel: (item) => String(item.title ?? 'Apresentação'),
  toForm: (item) => ({
    ...item,
    startsAt: toLocalDateTime(item.startsAt),
    endsAt: toLocalDateTime(item.endsAt),
    repertoireIds: Array.isArray(item.repertoireIds) ? item.repertoireIds.join(', ') : '',
  }),
  toPayload: (values, current) =>
    withAudit(
      {
        ...values,
        startsAt: toIsoDateTime(values.startsAt),
        endsAt: values.endsAt ? toIsoDateTime(values.endsAt) : undefined,
        repertoireIds: String(values.repertoireIds ?? '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      },
      current,
    ),
};

const media: DomainCrudConfig = {
  resource: 'media',
  singular: 'mídia',
  defaults: {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    coverUrl: '',
    videoUrl: '',
    kind: 'article',
    status: 'draft',
    publishedAt: '',
  },
  fields: [
    { name: 'title', label: 'Título', required: true },
    {
      name: 'slug',
      label: 'Slug',
      required: true,
      placeholder: 'titulo-da-publicacao',
      validate: (value) =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value ?? ''))
          ? null
          : 'Use somente letras minúsculas, números e hífens.',
    },
    {
      name: 'kind',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: 'article', label: 'Artigo' },
        { value: 'photo', label: 'Foto' },
        { value: 'video', label: 'Vídeo' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Rascunho' },
        { value: 'published', label: 'Publicado' },
      ],
    },
    { name: 'excerpt', label: 'Resumo', type: 'textarea', required: true },
    { name: 'body', label: 'Conteúdo', type: 'textarea', required: true },
    { name: 'coverUrl', label: 'URL da capa' },
    {
      name: 'videoUrl',
      label: 'URL do vídeo',
      showWhen: (values) => values.kind === 'video',
    },
    {
      name: 'publishedAt',
      label: 'Data da publicação',
      type: 'datetime-local',
      showWhen: (values) => values.status === 'published',
      validate: (value, values) =>
        values.status === 'published' && !value ? 'Informe a data de publicação.' : null,
    },
  ],
  columns: [
    { path: 'title', label: 'Título' },
    { path: 'kind', label: 'Tipo' },
    { path: 'status', label: 'Status', format: 'status' },
    { path: 'publishedAt', label: 'Publicação', format: 'datetime' },
    { path: 'slug', label: 'Slug' },
  ],
  itemLabel: (item) => String(item.title ?? 'Mídia'),
  toForm: (item) => ({ ...item, publishedAt: toLocalDateTime(item.publishedAt) }),
  toPayload: (values, current) =>
    withAudit(
      {
        ...values,
        publishedAt:
          values.status === 'published' && values.publishedAt
            ? toIsoDateTime(values.publishedAt)
            : undefined,
      },
      current,
    ),
};

const CONFIGS: Record<Exclude<Resource, 'portal'>, DomainCrudConfig> = {
  users,
  people,
  songs,
  patrimony,
  instruments,
  presentations,
  media,
};

export function getCrudConfig(resource: Exclude<Resource, 'portal'>): DomainCrudConfig {
  return CONFIGS[resource];
}

export function getValue(entity: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[part];
  }, entity);
}

function flattenEntity(entity: Record<string, unknown>): Record<string, unknown> {
  const flat = { ...entity };
  for (const [key, value] of Object.entries(entity)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        flat[`${key}.${nestedKey}`] = Array.isArray(nestedValue)
          ? nestedValue.join(', ')
          : nestedValue;
      }
    }
  }
  return flat;
}

function unflattenEntity(values: Record<string, unknown>): Record<string, unknown> {
  const entity: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(values)) {
    if (!path.includes('.')) {
      entity[path] = value;
      continue;
    }
    const [parent, child] = path.split('.');
    const nested = (entity[parent] as Record<string, unknown> | undefined) ?? {};
    nested[child] = value;
    entity[parent] = nested;
  }
  return entity;
}

function withAudit(
  payload: Record<string, unknown>,
  current?: Record<string, unknown>,
): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    ...payload,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
}

function toLocalDateTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoDateTime(value: unknown): string {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
