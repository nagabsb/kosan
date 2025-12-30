import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Phone, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import api from '../lib/api';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    room_id: '',
    full_name: '',
    email: '',
    phone: '',
    id_card_number: '',
    check_in_date: new Date().toISOString().split('T')[0],
    deposit_amount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tenantsRes, propsRes, roomsRes] = await Promise.all([
        api.get('/tenants'),
        api.get('/properties'),
        api.get('/rooms')
      ]);
      setTenants(tenantsRes.data);
      setProperties(propsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tenants', {
        ...formData,
        check_in_date: new Date(formData.check_in_date).toISOString(),
        deposit_amount: parseFloat(formData.deposit_amount)
      });
      toast.success('Penghuni berhasil ditambahkan');
      setShowDialog(false);
      setFormData({
        property_id: '',
        room_id: '',
        full_name: '',
        email: '',
        phone: '',
        id_card_number: '',
        check_in_date: new Date().toISOString().split('T')[0],
        deposit_amount: ''
      });
      loadData();
    } catch (error) {
      toast.error('Gagal menambahkan penghuni');
    }
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-red-100 text-red-700',
      overdue: 'bg-orange-100 text-orange-700'
    };
    const labels = {
      paid: 'Lunas',
      unpaid: 'Belum Bayar',
      overdue: 'Terlambat'
    };
    return <Badge className={variants[status] || variants.unpaid}>{labels[status] || labels.unpaid}</Badge>;
  };

  const availableRooms = rooms.filter(r => r.property_id === formData.property_id && r.status === 'available');

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="tenants-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Penghuni</h1>
            <p className="text-slate-600 mt-1">Database penghuni dan riwayat</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-cyan-600 hover:bg-cyan-700" data-testid="add-tenant-btn">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Penghuni
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Kamar</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Status Bayar</TableHead>
                    <TableHead>Deposit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id} data-testid={`tenant-row-${tenant.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{tenant.full_name}</p>
                          <p className="text-sm text-slate-500">KTP: {tenant.id_card_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{tenant.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{tenant.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-900">Kamar {rooms.find(r => r.id === tenant.room_id)?.room_number || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">{format(new Date(tenant.check_in_date), 'dd MMM yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(tenant.payment_status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-900">Rp {tenant.deposit_amount.toLocaleString('id-ID')}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Penghuni Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_id">Properti</Label>
                  <Select value={formData.property_id} onValueChange={(val) => setFormData({ ...formData, property_id: val, room_id: '' })} required>
                    <SelectTrigger data-testid="tenant-property-select">
                      <SelectValue placeholder="Pilih properti" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room_id">Kamar</Label>
                  <Select value={formData.room_id} onValueChange={(val) => setFormData({ ...formData, room_id: val })} required disabled={!formData.property_id}>
                    <SelectTrigger data-testid="tenant-room-select">
                      <SelectValue placeholder="Pilih kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>Kamar {room.room_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    data-testid="tenant-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="id_card_number">Nomor KTP</Label>
                  <Input
                    id="id_card_number"
                    value={formData.id_card_number}
                    onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
                    required
                    data-testid="tenant-idcard-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="tenant-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Nomor HP/WA</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid="tenant-phone-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="check_in_date">Tanggal Check-in</Label>
                  <Input
                    id="check_in_date"
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    required
                    data-testid="tenant-checkin-input"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit_amount">Deposit/Jaminan</Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                    required
                    data-testid="tenant-deposit-input"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700" data-testid="tenant-submit-btn">
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