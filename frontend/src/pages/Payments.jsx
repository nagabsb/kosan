import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function Payments() {
  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="payments-page">
        <h1 className="text-3xl font-bold text-slate-900">Pembayaran</h1>
        <p className="text-slate-600">Halaman ini akan menampilkan tracking pembayaran dan verifikasi bukti transfer</p>
      </div>
    </DashboardLayout>
  );
}