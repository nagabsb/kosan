import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'owner',
    property_name: '',
    city: '',
    total_rooms: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      setAuth(response.data.access_token, response.data.user);
      toast.success('Registrasi berhasil! Selamat datang di ManageKost!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-10 h-10 text-blue-700" />
            <span className="text-3xl font-bold text-slate-900">ManageKost</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Mulai Trial Gratis</h1>
          <p className="text-slate-600">14 hari gratis, tanpa kartu kredit</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-1">Data Diri</h3>
              <p className="text-sm text-slate-600">Informasi akun Anda</p>
            </div>

            <div>
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="mt-1"
                data-testid="register-name-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                  data-testid="register-email-input"
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="mt-1"
                  data-testid="register-phone-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="mt-1"
                data-testid="register-password-input"
              />
            </div>

            <div className="border-t border-slate-200 pt-5 mt-6">
              <h3 className="font-semibold text-slate-900 mb-1">Data Kost</h3>
              <p className="text-sm text-slate-600 mb-4">Informasi properti kost pertama Anda</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="property_name">Nama Kost</Label>
                  <Input
                    id="property_name"
                    type="text"
                    placeholder="Kost Melati"
                    value={formData.property_name}
                    onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                    required
                    className="mt-1"
                    data-testid="register-property-name-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Jakarta"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="mt-1"
                      data-testid="register-city-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_rooms">Jumlah Kamar</Label>
                    <Input
                      id="total_rooms"
                      type="number"
                      placeholder="10"
                      value={formData.total_rooms}
                      onChange={(e) => setFormData({ ...formData, total_rooms: e.target.value })}
                      required
                      className="mt-1"
                      data-testid="register-rooms-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 mt-6"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-700 hover:underline font-medium">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}