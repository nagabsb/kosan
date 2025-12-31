import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Home, BedDouble, Users, DollarSign, AlertCircle, Zap, Settings, LogOut, ShoppingBag, UserCog } from 'lucide-react';
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
    { path: '/canteen', label: 'Kantin', icon: ShoppingBag },
    { path: '/complaints', label: 'Keluhan', icon: AlertCircle },
    { path: '/utility-meters', label: 'Meteran', icon: Zap },
  ];

  // Tambahkan menu pengelola untuk owner
  if (user?.role === 'owner') {
    menuItems.push({ path: '/pengelola', label: 'Pengelola', icon: UserCog });
  }

  menuItems.push({ path: '/settings', label: 'Pengaturan', icon: Settings });

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-700 to-sky-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">ManageKost</span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            {user?.role === 'pengelola' && (
              <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Pengelola</span>
            )}
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