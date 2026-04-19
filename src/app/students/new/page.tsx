'use client';

import { EntityFormPage } from '@/components/entity/EntityFormPage';
import {
  getInitialStudentFormData,
  getStudentFormFields,
  toStudentCreatePayload,
  type Student,
  type StudentFormData,
} from '@/app/students/studentEntityConfig';

export default function StudentAddPage() {
  return (
    <EntityFormPage<StudentFormData, Student>
      resource="students"
      mode="create"
      entityDisplayName="Aluno"
      title="Novo Aluno"
      initialValues={getInitialStudentFormData()}
      fields={getStudentFormFields('create')}
      saveLabel="Criar Aluno"
      savingLabel="Salvando..."
      mapFormToPayload={toStudentCreatePayload}
      getSuccessPath={(student) => `/students/${student.id}`}
    />
  );
}
