'use client';

import { EntityFormPage } from '@/components/entity/EntityFormPage';
import {
  getInitialStudentFormData,
  getStudentFormFields,
  renderStudentUnderageNotice,
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
      renderNotice={renderStudentUnderageNotice}
      mapFormToPayload={toStudentCreatePayload}
      getSuccessPath={(student) => `/students/${student.id}`}
    />
  );
}
