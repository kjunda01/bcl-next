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
  status: 'active' | 'inactive';
}

export interface StudentFormData {
  id?: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  enrollmentDate: string;
  profileImageUrl: string;
  status: 'active' | 'inactive';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getTodayAsDateInput(): string {
  return new Date().toISOString().split('T')[0];
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
    status: student.status,
  };
}

export function toStudentCreatePayload(formData: StudentFormData): Omit<Student, 'id'> {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    birthDate: formData.birthDate,
    enrollmentDate: formData.enrollmentDate,
    profileImageUrl: formData.profileImageUrl || undefined,
    status: formData.status,
  };
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
    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-border bg-card-secondary text-2xl font-semibold text-primary">
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