'use client';

import { use } from 'react';
import { EntityFormPage } from '@/components/entity/EntityFormPage';
import {
  getInitialStudentFormData,
  getStudentFormFields,
  toStudentFormData,
  type Student,
  type StudentFormData,
} from '@/app/students/studentEntityConfig';

export default function StudentEditPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const unwrappedParams = use(params);

  return (
    <EntityFormPage<StudentFormData, Student>
      resource="students"
      mode="edit"
      id={unwrappedParams.id}
      entityDisplayName="Aluno"
      title="Editar Aluno"
      initialValues={getInitialStudentFormData()}
      fields={getStudentFormFields('edit')}
      saveLabel="Salvar"
      savingLabel="Salvando..."
      notFoundMessage="Aluno não encontrado."
      mapLoadedToForm={toStudentFormData}
      getSuccessPath={(student) => `/students/${student.id}`}
    />
  );
}