'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';

interface Student {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const student = await apiFetch<Student>(`/students/${unwrappedParams.id}`);
        setStudent(student);
      } catch {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Aluno não encontrado.</p>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline flex items-center gap-1"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold text-card-foreground">
          {student.firstName} {student.lastName}
        </h1>
        <div /> {/* Spacer for layout */}
      </div>

      {/* Card Container */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Status Badge */}
        <div className="bg-gradient-to-r from-card to-card-secondary p-6 border-b border-border">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            student.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {student.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-muted mb-2 block">
                E-mail
              </label>
              <p className="text-card-foreground">{student.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-muted mb-2 block">
                Telefone
              </label>
              <p className="text-card-foreground">{student.phone}</p>
            </div>

            {/* Birth Date */}
            <div>
              <label className="text-sm font-semibold text-muted mb-2 block">
                Data de Nascimento
              </label>
              <p className="text-card-foreground">
                {new Date(student.birthDate).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Enrollment Date */}
            <div>
              <label className="text-sm font-semibold text-muted mb-2 block">
                Data de Matrícula
              </label>
              <p className="text-card-foreground">
                {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Student ID */}
            <div>
              <label className="text-sm font-semibold text-muted mb-2 block">
                ID do Aluno
              </label>
              <p className="text-card-foreground font-mono">{student.id}</p>
            </div>

            {/* Status Label */}
            <div>
              <label className="text-sm font-semibold text-muted mb-2 block">
                Status
              </label>
              <p className="text-card-foreground capitalize">
                {student.status === 'active' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => router.push(`/students/${student.id}/edit`)}
          className="btn-secondary"
        >
          Editar
        </button>
        <button
          onClick={() => router.back()}
          className="btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
