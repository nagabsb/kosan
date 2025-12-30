import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function Complaints() {
  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="complaints-page">
        <h1 className="text-3xl font-bold text-slate-900">Keluhan & Maintenance</h1>
        <p className="text-slate-600">Halaman ini akan menampilkan sistem keluhan dari penghuni</p>
      </div>
    </DashboardLayout>
  );
}