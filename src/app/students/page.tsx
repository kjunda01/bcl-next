'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityCRUD } from '@/hooks/useCRUD';
import { SharedTable } from '@/components/sharedTable/SharedTable';
import { CRUDModal } from '@/components/CRUDModal';
import type { ColumnConfig, TableAction } from '@/components/sharedTable/SharedTable';
import { renderStudentAvatar } from '@/app/students/studentEntityConfig';

interface Student {
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

export default function StudentsPage() {
  const crud = useEntityCRUD<Student>('students');
  const router = useRouter();

  useEffect(() => {
    crud.loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnConfig<Student>[] = [
    {
      key: 'firstName',
      sortKey: 'firstName',
      label: 'Nome',
      sortable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full">{renderStudentAvatar(item)}</div>
          <span>{item.firstName} {item.lastName}</span>
        </div>
      )
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
      render: (value) => new Date(value as string).toLocaleDateString('pt-BR')
    },
    {
      key: 'enrollmentDate',
      label: 'Data de Matrícula',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString('pt-BR')
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

  const handleDeleteStudent = async () => {
    if (!crud.itemToDelete) return;

    try {
      await crud.deleteItemOnServer(crud.itemToDelete.id);
      // the entity hook already removes the item from state
    } catch {
      crud.setError('Erro ao excluir aluno');
    }
  };

  const actions: TableAction<Student>[] = [
    {
      label: 'Visualizar',
      icon: 'visibility',
      color: 'primary',
      onClick: (student) => {
        router.push(`/students/${student.id}`);
      }
    },
    {
      label: 'Editar',
      icon: 'edit',
      color: 'secondary',
      onClick: (student) => {
        router.push(`/students/${student.id}/edit`);
      }
    },
    {
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      onClick: (student) => crud.openDeleteModal(student)
    }
  ];

  const handleAddStudent = () => {
    router.push('/students/new');
  };

  if (crud.error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-red-600">{crud.error}</p>
          <button
            onClick={() => {
              crud.setError(null);
              void crud.loadItems();
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-10xl mx-auto px-4 py-6">
      <SharedTable
        data={crud.items}
        columns={columns}
        actions={actions}
        title="Alunos"
        loading={crud.loading}
        emptyMessage="Nenhum aluno cadastrado."
        canAdd={true}
        onAdd={handleAddStudent}
        searchPlaceholder="Buscar por nome, email ou telefone..."
        hideableColumns={['phone', 'birthDate', 'enrollmentDate']}
      />

      <CRUDModal
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir"
        itemName={crud.itemToDelete ? `${crud.itemToDelete.firstName} ${crud.itemToDelete.lastName}` : ''}
        isOpen={!!crud.itemToDelete}
        onConfirm={handleDeleteStudent}
        onCancel={() => crud.setItemToDelete(null)}
      />
    </div>
  );
}