'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

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

export default function StudentAddPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    }
    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const createdStudent = await apiFetch<Student>('/students', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      router.push(`/students/${createdStudent.id}`);
    } finally {
      setSaving(false);
    }
  };

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
          Novo Aluno
        </h1>
        <div /> {/* Spacer for layout */}
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Name Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="text-sm font-semibold text-card-foreground block mb-2">
                Nome <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-background border rounded-md text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.firstName ? 'border-red-600' : 'border-border'
                }`}
                placeholder="João"
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="text-sm font-semibold text-card-foreground block mb-2">
                Sobrenome <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-background border rounded-md text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.lastName ? 'border-red-600' : 'border-border'
                }`}
                placeholder="Silva"
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email and Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-card-foreground block mb-2">
                E-mail <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-background border rounded-md text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? 'border-red-600' : 'border-border'
                }`}
                placeholder="joao.silva@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="text-sm font-semibold text-card-foreground block mb-2">
                Telefone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-background border rounded-md text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.phone ? 'border-red-600' : 'border-border'
                }`}
                placeholder="(35) 98765-4321"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Date Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="text-sm font-semibold text-card-foreground block mb-2">
                Data de Nascimento <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-background border rounded-md text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.birthDate ? 'border-red-600' : 'border-border'
                }`}
              />
              {errors.birthDate && (
                <p className="text-red-600 text-sm mt-1">{errors.birthDate}</p>
              )}
            </div>

            {/* Enrollment Date (Auto-set) */}
            <div>
              <label htmlFor="enrollmentDate" className="text-sm font-semibold text-card-foreground block mb-2">
                Data de Matrícula <span className="text-muted">(hoje)</span>
              </label>
              <input
                type="date"
                id="enrollmentDate"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                disabled
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-card-foreground cursor-not-allowed opacity-50 focus:outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="text-sm font-semibold text-card-foreground block mb-2">
              Status <span className="text-red-600">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-background border rounded-md text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.status ? 'border-red-600' : 'border-border'
              }`}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-sm mt-1">{errors.status}</p>
            )}
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Criar Aluno'}
        </button>
        <button
          onClick={() => router.back()}
          disabled={saving}
          className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
