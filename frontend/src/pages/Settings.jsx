import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function Settings() {
  const { user } = useAuthStore();
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleUpgrade = (planType) => {
    const MIDTRANS_CLIENT_KEY = 'Mid-client-hY67kTUZZIWc3L_P';
    
    toast.info('Menghubungkan ke payment gateway...');
    
    setTimeout(() => {
      toast.success(`Upgrade ke ${planType} Plan berhasil! Silahkan lakukan pembayaran.`);
    }, 1000);
  };


  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    toast.success('Profil berhasil diupdate');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Password konfirmasi tidak cocok');
      return;
    }
    toast.success('Password berhasil diubah');
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="settings-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
          <p className="text-slate-600 mt-1">Kelola akun dan preferensi Anda</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                    Simpan Perubahan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Ubah Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="current_password">Password Saat Ini</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_password">Password Baru</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                    Ubah Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Status Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-blue-900">Trial Period</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Status: <span className="font-medium">{user?.subscription_status || 'Trial'}</span>
                      </p>
                      {user?.trial_end_date && (
                        <p className="text-sm text-blue-700">
                          Berakhir: {new Date(user.trial_end_date).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                    <Button className="bg-blue-700 hover:bg-blue-800">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="border border-slate-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Basic Plan</h3>
                    <div className="text-3xl font-bold text-slate-900 mb-4">Rp 99.000<span className="text-sm font-normal text-slate-600">/bulan</span></div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>✅ Hingga 3 properti</li>
                      <li>✅ Unlimited kamar</li>
                      <li>✅ Management penghuni</li>
                      <li>✅ Dashboard analytics</li>
                    </ul>
                    <Button variant="outline" className="w-full mt-6" onClick={() => handleUpgrade('Basic')}>Pilih Plan</Button>
                  </div>

                  <div className="border-2 border-blue-600 rounded-lg p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Popular
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Premium Plan</h3>
                    <div className="text-3xl font-bold text-slate-900 mb-4">Rp 199.000<span className="text-sm font-normal text-slate-600">/bulan</span></div>
                    <ul className="space-y-2 text-slate-600">
                      <li>✅ Unlimited properti</li>
                      <li>✅ Unlimited kamar</li>
                      <li>✅ WhatsApp integration</li>
                      <li>✅ Email notifications</li>
                      <li>✅ Priority support</li>
                    </ul>
                    <Button className="w-full mt-6 bg-blue-700 hover:bg-blue-800" onClick={() => handleUpgrade('Premium')}>Pilih Plan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
