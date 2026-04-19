import { useEffect, useState } from 'react';
import { SharedTable } from '../components/sharedTable/SharedTable';
import type { ColumnConfig, TableAction } from '../components/sharedTable/SharedTable';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao.silva@email.com',
    phone: '(35) 98765-4321',
    birthDate: '2005-03-15',
    enrollmentDate: '2023-02-01',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@email.com',
    phone: '(35) 99876-5432',
    birthDate: '2004-07-22',
    enrollmentDate: '2023-03-15',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Pedro',
    lastName: 'Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(35) 98765-1234',
    birthDate: '2006-11-08',
    enrollmentDate: '2023-01-20',
    status: 'inactive'
  }
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento de dados
    const loadStudents = async () => {
      try {
        // TODO: Substituir por chamada real da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStudents(mockStudents);
      } catch (err) {
        setError('Erro ao carregar alunos');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const columns: ColumnConfig<Student>[] = [
    {
      key: 'firstName',
      label: 'Nome',
      sortable: true,
      render: (_, item) => `${item.firstName} ${item.lastName}`
    },
    {
      key: 'email',
      label: 'E-mail',
      sortable: true
    },
    {
      key: 'phone',
      label: 'Telefone',
      sortable: false
    },
    {
      key: 'birthDate',
      label: 'Data de Nascimento',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'enrollmentDate',
      label: 'Data de Matrícula',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  const actions: TableAction<Student>[] = [
    {
      label: 'Visualizar',
      icon: 'visibility',
      color: 'primary',
      onClick: (student) => {
        console.log('Visualizar aluno:', student);
        // TODO: Implementar navegação para página de detalhes
      }
    },
    {
      label: 'Editar',
      icon: 'edit',
      color: 'secondary',
      onClick: (student) => {
        console.log('Editar aluno:', student);
        // TODO: Implementar navegação para página de edição
      }
    },
    {
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      onClick: (student) => {
        if (window.confirm(`Tem certeza que deseja excluir o aluno ${student.firstName} ${student.lastName}?`)) {
          console.log('Excluir aluno:', student);
          // TODO: Implementar exclusão
          setStudents(prev => prev.filter(s => s.id !== student.id));
        }
      }
    }
  ];

  const handleAddStudent = () => {
    console.log('Adicionar novo aluno');
    // TODO: Implementar navegação para página de criação
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <SharedTable
        data={students}
        columns={columns}
        actions={actions}
        title="Alunos"
        loading={loading}
        emptyMessage="Nenhum aluno cadastrado."
        canAdd={true}
        onAdd={handleAddStudent}
        searchPlaceholder="Buscar por nome, email ou telefone..."
        hideableColumns={['phone', 'birthDate', 'enrollmentDate']}
      />
    </div>
  );
}