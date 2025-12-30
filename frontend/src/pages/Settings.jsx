import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="settings-page">
        <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-600">Halaman ini akan menampilkan pengaturan akun dan role management</p>
      </div>
    </DashboardLayout>
  );
}