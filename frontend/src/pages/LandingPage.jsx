import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, TrendingUp, Bell, Wrench, DollarSign } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: 'Multi-Property Management',
      description: 'Kelola banyak properti kost dalam satu dashboard'
    },
    {
      icon: Users,
      title: 'Manajemen Penghuni',
      description: 'Database lengkap penghuni dengan riwayat pembayaran'
    },
    {
      icon: DollarSign,
      title: 'Tracking Pembayaran',
      description: 'Upload dan verifikasi bukti transfer otomatis'
    },
    {
      icon: TrendingUp,
      title: 'Dashboard Analytics',
      description: 'Laporan occupancy rate dan revenue real-time'
    },
    {
      icon: Bell,
      title: 'WhatsApp Integration',
      description: 'Kirim reminder pembayaran via WhatsApp otomatis'
    },
    {
      icon: Wrench,
      title: 'Sistem Keluhan',
      description: 'Kelola maintenance request dengan status tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-700" />
              <span className="text-2xl font-bold text-slate-900">ManageKost</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')} data-testid="nav-login-btn">
                Masuk
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-blue-700 hover:bg-blue-800" data-testid="nav-register-btn">
                Daftar Gratis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Sistem Management Kost
            <br />
            <span className="text-blue-700">Paling Modern</span> di Indonesia
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Kelola properti kost dengan mudah. Tracking pembayaran, kirim reminder otomatis, dan tingkatkan occupancy rate.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')} className="bg-blue-700 hover:bg-blue-800 text-lg px-8" data-testid="hero-cta-btn">
              Mulai Trial 14 Hari Gratis
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-blue-700 text-blue-700 hover:bg-blue-50">
              Lihat Demo
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-4">Tanpa kartu kredit • Setup 5 menit • Cancel kapan saja</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all" data-testid={`feature-card-${index}`}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-blue-700 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Digitalisasi Management Kost Anda?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Bergabung dengan ratusan pemilik kost yang sudah meningkatkan efisiensi operasional mereka
          </p>
          <Button size="lg" onClick={() => navigate('/register')} className="bg-white text-blue-700 hover:bg-slate-100 text-lg px-8" data-testid="cta-bottom-btn">
            Daftar Sekarang
          </Button>
        </div>
      </section>

      <footer className="bg-slate-900 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2024 ManageKost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}