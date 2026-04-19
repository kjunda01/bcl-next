'use client';

import { use } from 'react';
import { EntityDetailPage } from '@/components/entity/EntityDetailPage';
import {
  renderStudentStatusBadge,
  studentDetailFields,
  type Student,
} from '@/app/students/studentEntityConfig';

export default function StudentDetailPage(props: Readonly<{ params: Promise<{ id: string }> }>) {
  const unwrappedParams = use(props.params);
  return (
    <EntityDetailPage<Student>
      resource="students"
      id={unwrappedParams.id}
      entityDisplayName="Aluno"
      notFoundMessage="Aluno não encontrado."
      getTitle={(student) => `${student.firstName} ${student.lastName}`}
      badge={renderStudentStatusBadge}
      fields={studentDetailFields}
      editPath={(student) => `/students/${student.id}/edit`}
    />
  );
}
