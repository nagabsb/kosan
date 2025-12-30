import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function UtilityMeters() {
  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="utility-meters-page">
        <h1 className="text-3xl font-bold text-slate-900">Meteran Listrik & Air</h1>
        <p className="text-slate-600">Halaman ini akan menampilkan pencatatan meteran listrik dan air</p>
      </div>
    </DashboardLayout>
  );
}