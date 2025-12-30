import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, TrendingUp, BedDouble, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const occupancyData = [
    { name: 'Terisi', value: stats?.occupied_rooms || 0, color: '#0891b2' },
    { name: 'Kosong', value: stats?.available_rooms || 0, color: '#f97316' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview management kost Anda</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="stat-card-properties">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Properti</CardTitle>
                  <Building2 className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats?.properties_count || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Properti aktif</p>
                </CardContent>
              </Card>

              <Card data-testid="stat-card-rooms">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Kamar</CardTitle>
                  <BedDouble className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats?.total_rooms || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">{stats?.occupied_rooms || 0} terisi, {stats?.available_rooms || 0} kosong</p>
                </CardContent>
              </Card>

              <Card data-testid="stat-card-occupancy">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Occupancy Rate</CardTitle>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-600">{stats?.occupancy_rate || 0}%</div>
                  <p className="text-xs text-slate-500 mt-1">Tingkat hunian</p>
                </CardContent>
              </Card>

              <Card data-testid="stat-card-revenue">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">Rp {(stats?.total_revenue || 0).toLocaleString('id-ID')}</div>
                  <p className="text-xs text-slate-500 mt-1">Total pendapatan</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {occupancyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-cyan-600" />
                      <span className="text-slate-700">Total Penghuni</span>
                    </div>
                    <span className="font-semibold text-slate-900">{stats?.tenants_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-orange-500" />
                      <span className="text-slate-700">Pembayaran Pending</span>
                    </div>
                    <span className="font-semibold text-orange-600">{stats?.pending_payments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-slate-700">Keluhan Terbuka</span>
                    </div>
                    <span className="font-semibold text-red-600">{stats?.open_complaints || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/properties" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Building2 className="w-8 h-8 text-cyan-600 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Kelola Properti</h3>
                    <p className="text-sm text-slate-600">Tambah dan kelola properti kost Anda</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/tenants" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 text-cyan-600 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Manajemen Penghuni</h3>
                    <p className="text-sm text-slate-600">Database dan riwayat penghuni</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/payments" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <DollarSign className="w-8 h-8 text-cyan-600 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Tracking Pembayaran</h3>
                    <p className="text-sm text-slate-600">Verifikasi bukti transfer</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}