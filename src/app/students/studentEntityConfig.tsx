import Image from 'next/image';
import type { EntityDetailField } from '@/components/entity/EntityDetailPage';
import type { EntityFormField } from '@/components/entity/EntityFormPage';

export interface Student {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  enrollmentDate: string;
  profileImageUrl?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: GuardianRelationship;
  status: 'active' | 'inactive';
}

export type GuardianRelationship = 'pai' | 'mae' | 'irmao' | 'tutor_legal';

export interface StudentFormData {
  id?: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  enrollmentDate: string;
  profileImageUrl: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: GuardianRelationship | '';
  status: 'active' | 'inactive';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RELATIONSHIP_LABEL: Record<GuardianRelationship, string> = {
  pai: 'Pai',
  mae: 'Mãe',
  irmao: 'Irmão',
  tutor_legal: 'Tutor legal',
};

function getTodayAsDateInput(): string {
  return new Date().toISOString().split('T')[0];
}

function getAgeFromBirthDate(birthDate: string): number | null {
  if (!birthDate) {
    return null;
  }

  const parsedDate = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const hasNotHadBirthdayYet =
    today.getMonth() < parsedDate.getMonth() ||
    (today.getMonth() === parsedDate.getMonth() && today.getDate() < parsedDate.getDate());

  if (hasNotHadBirthdayYet) {
    age -= 1;
  }

  return age;
}

export function isStudentUnderage(birthDate: string): boolean {
  const age = getAgeFromBirthDate(birthDate);
  return age !== null && age < 18;
}

function getGuardianRelationshipLabel(value?: GuardianRelationship): string {
  return value ? RELATIONSHIP_LABEL[value] : '—';
}

export function getInitialStudentFormData(): StudentFormData {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    enrollmentDate: getTodayAsDateInput(),
    profileImageUrl: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: '',
    status: 'active',
  };
}

export function toStudentFormData(student: Student): StudentFormData {
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone,
    birthDate: student.birthDate,
    enrollmentDate: student.enrollmentDate,
    profileImageUrl: student.profileImageUrl ?? '',
    guardianName: student.guardianName ?? '',
    guardianPhone: student.guardianPhone ?? '',
    guardianRelationship: student.guardianRelationship ?? '',
    status: student.status,
  };
}

export function toStudentCreatePayload(formData: StudentFormData): Omit<Student, 'id'> {
  const isUnderage = isStudentUnderage(formData.birthDate);

  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    birthDate: formData.birthDate,
    enrollmentDate: formData.enrollmentDate,
    profileImageUrl: formData.profileImageUrl || undefined,
    guardianName: isUnderage ? formData.guardianName.trim() : undefined,
    guardianPhone: isUnderage ? formData.guardianPhone.trim() : undefined,
    guardianRelationship: isUnderage ? (formData.guardianRelationship || undefined) : undefined,
    status: formData.status,
  };
}

export function renderStudentUnderageNotice(formData: StudentFormData) {
  if (!isStudentUnderage(formData.birthDate)) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
      <p className="text-sm font-semibold">Aluno menor de idade</p>
      <p className="text-sm mt-1">
        Os dados do responsável são obrigatórios para concluir este cadastro.
      </p>
    </div>
  );
}

export function renderStudentAvatar(student: Pick<Student, 'firstName' | 'lastName' | 'profileImageUrl'>) {
  const fullName = `${student.firstName} ${student.lastName}`.trim();

  if (student.profileImageUrl) {
    return (
      <Image
        src={student.profileImageUrl}
        alt={`Foto de perfil de ${fullName}`}
        width={48}
        height={48}
        className="h-[48px] w-[48px] rounded-full object-cover border border-border"
      />
    );
  }

  return (
    <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-border bg-card-secondary text-2xl font-semibold text-primary">
      {(student.firstName?.[0] || student.lastName?.[0] || '?').toUpperCase()}
    </div>
  );
}

export function getStudentFormFields(mode: 'create' | 'edit'): EntityFormField<StudentFormData>[] {
  return [
    {
      name: 'profileImageUrl',
      label: 'Foto de Perfil',
      type: 'file',
      accept: 'image/*',
      colSpan: 2,
      helpText: 'A imagem selecionada será armazenada junto ao cadastro do aluno.',
    },
    {
      name: 'firstName',
      label: 'Nome',
      required: true,
      placeholder: 'João',
    },
    {
      name: 'lastName',
      label: 'Sobrenome',
      required: true,
      placeholder: 'Silva',
    },
    {
      name: 'email',
      label: 'E-mail',
      type: 'email',
      required: true,
      placeholder: 'joao.silva@email.com',
      validate: (value) => {
        if (!value) {
          return null;
        }

        return EMAIL_REGEX.test(String(value)) ? null : 'E-mail inválido';
      },
    },
    {
      name: 'phone',
      label: 'Telefone',
      type: 'tel',
      required: true,
      placeholder: '(35) 98765-4321',
    },
    {
      name: 'birthDate',
      label: 'Data de Nascimento',
      type: 'date',
      required: true,
    },
    {
      name: 'guardianName',
      label: 'Nome do Responsável',
      required: true,
      placeholder: 'Nome completo do responsável',
      showWhen: (formData) => isStudentUnderage(formData.birthDate),
    },
    {
      name: 'guardianPhone',
      label: 'Telefone do Responsável',
      type: 'tel',
      required: true,
      placeholder: '(35) 98765-4321',
      showWhen: (formData) => isStudentUnderage(formData.birthDate),
    },
    {
      name: 'guardianRelationship',
      label: 'Parentesco do Responsável',
      type: 'select',
      required: true,
      colSpan: 2,
      showWhen: (formData) => isStudentUnderage(formData.birthDate),
      options: [
        { value: '', label: 'Selecione uma opção' },
        { value: 'pai', label: 'Pai' },
        { value: 'mae', label: 'Mãe' },
        { value: 'irmao', label: 'Irmão' },
        { value: 'tutor_legal', label: 'Tutor legal' },
      ],
      helpText: 'Obrigatório para alunos menores de idade.',
    },
    {
      name: 'enrollmentDate',
      label: 'Data de Matrícula',
      type: 'date',
      readOnly: true,
      readOnlyHint: mode === 'edit' ? '(somente leitura)' : '(hoje)',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      colSpan: 2,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
      ],
    },
    ...(mode === 'edit'
      ? [
          {
            name: 'id',
            label: 'ID do Aluno',
            readOnly: true,
            readOnlyHint: '(somente leitura)',
            colSpan: 2,
          } satisfies EntityFormField<StudentFormData>,
        ]
      : []),
  ];
}

export const studentDetailFields: EntityDetailField<Student>[] = [
  {
    label: 'Foto de Perfil',
    colSpan: 2,
    render: (student) => renderStudentAvatar(student),
  },
  {
    label: 'E-mail',
    render: (student) => student.email,
  },
  {
    label: 'Telefone',
    render: (student) => student.phone,
  },
  {
    label: 'Data de Nascimento',
    render: (student) => new Date(student.birthDate).toLocaleDateString('pt-BR'),
  },
  {
    label: 'Responsável',
    colSpan: 2,
    render: (student) => {
      if (!isStudentUnderage(student.birthDate)) {
        return 'Não se aplica para aluno maior de idade';
      }

      return student.guardianName || 'Não informado';
    },
  },
  {
    label: 'Telefone do Responsável',
    render: (student) => {
      if (!isStudentUnderage(student.birthDate)) {
        return 'Não se aplica';
      }

      return student.guardianPhone || 'Não informado';
    },
  },
  {
    label: 'Parentesco do Responsável',
    render: (student) => {
      if (!isStudentUnderage(student.birthDate)) {
        return 'Não se aplica';
      }

      return getGuardianRelationshipLabel(student.guardianRelationship);
    },
  },
  {
    label: 'Data de Matrícula',
    render: (student) => new Date(student.enrollmentDate).toLocaleDateString('pt-BR'),
  },
  {
    label: 'ID do Aluno',
    render: (student) => <span className="font-mono">{student.id}</span>,
  },
  {
    label: 'Status',
    render: (student) => (student.status === 'active' ? 'Ativo' : 'Inativo'),
  },
];

export function renderStudentStatusBadge(student: Student) {
  return (
    <span
      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {student.status === 'active' ? 'Ativo' : 'Inativo'}
    </span>
  );
}