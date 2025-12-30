import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Home, BedDouble, Users, DollarSign, AlertCircle, Zap, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../store/authStore';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/properties', label: 'Properti', icon: Building2 },
    { path: '/rooms', label: 'Kamar', icon: BedDouble },
    { path: '/tenants', label: 'Penghuni', icon: Users },
    { path: '/payments', label: 'Pembayaran', icon: DollarSign },
    { path: '/complaints', label: 'Keluhan', icon: AlertCircle },
    { path: '/utility-meters', label: 'Meteran', icon: Zap },
    { path: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-cyan-600" />
            <span className="text-2xl font-bold text-slate-900">Kostify</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}