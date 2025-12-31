import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCog, Mail, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function Pengelola() {
  const [pengelolaList, setPengelolaList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    property_id: '',
    permissions: ['manage_rooms', 'manage_tenants']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pengelolaRes, propsRes] = await Promise.all([
        api.get('/pengelola'),
        api.get('/properties')
      ]);
      setPengelolaList(pengelolaRes.data);
      setProperties(propsRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pengelola', formData);
      toast.success('Pengelola berhasil ditambahkan');
      setShowDialog(false);
      setFormData({
        email: '',
        full_name: '',
        phone: '',
        password: '',
        property_id: '',
        permissions: ['manage_rooms', 'manage_tenants']
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menambahkan pengelola');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengelola ini?')) return;
    try {
      await api.delete(`/pengelola/${id}`);
      toast.success('Pengelola berhasil dihapus');
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus pengelola');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="pengelola-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pengelola Kost</h1>
            <p className="text-slate-600 mt-1">Kelola tim pengelola properti Anda</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-blue-700 hover:bg-blue-800" data-testid="add-pengelola-btn">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pengelola
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : pengelolaList.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <UserCog className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum ada pengelola</h3>
              <p className="text-slate-600 mb-6">Tambahkan pengelola untuk membantu mengelola properti kost Anda</p>
              <Button onClick={() => setShowDialog(true)} className="bg-blue-700 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengelola
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Properti</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengelolaList.map((pengelola) => {
                    const property = properties.find(p => p.id === pengelola.property_id);
                    return (
                      <TableRow key={pengelola.id} data-testid={`pengelola-row-${pengelola.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCog className="w-4 h-4 text-blue-700" />
                            </div>
                            <span className="font-medium text-slate-900">{pengelola.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-600">{pengelola.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-600">{pengelola.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-900">{property?.name || 'Semua Properti'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {pengelola.permissions && pengelola.permissions.map((perm) => (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                {perm === 'manage_rooms' ? 'Kamar' : perm === 'manage_tenants' ? 'Penghuni' : perm}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(pengelola.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pengelola Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  data-testid="pengelola-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="pengelola-email-input"
                />
              </div>
              <div>
                <Label htmlFor="phone">Nomor HP</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  data-testid="pengelola-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="pengelola-password-input"
                />
              </div>
              <div>
                <Label htmlFor="property_id">Properti (Opsional)</Label>
                <Select value={formData.property_id} onValueChange={(val) => setFormData({ ...formData, property_id: val })}>
                  <SelectTrigger data-testid="pengelola-property-select">
                    <SelectValue placeholder="Semua Properti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Properti</SelectItem>
                    {properties.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800" data-testid="pengelola-submit-btn">
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}