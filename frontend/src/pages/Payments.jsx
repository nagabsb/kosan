import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import api from '../lib/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    tenant_id: '',
    property_id: '',
    room_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'transfer',
    notes: '',
    proof_file: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, propsRes, roomsRes, tenantsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/properties'),
        api.get('/rooms'),
        api.get('/tenants')
      ]);
      setPayments(paymentsRes.data);
      setProperties(propsRes.data);
      setRooms(roomsRes.data);
      setTenants(tenantsRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate file upload - in production, upload to cloud storage (S3, Cloudinary, etc)
      let proofUrl = null;
      if (formData.proof_file) {
        // Convert to base64 for demo purposes
        const reader = new FileReader();
        reader.onloadend = async () => {
          proofUrl = reader.result;
          
          await api.post('/payments', {
            tenant_id: formData.tenant_id,
            property_id: formData.property_id,
            room_id: formData.room_id,
            amount: parseFloat(formData.amount),
            payment_date: new Date(formData.payment_date).toISOString(),
            payment_method: formData.payment_method,
            notes: formData.notes,
            proof_url: proofUrl
          });
          
          toast.success('Pembayaran berhasil dicatat dengan bukti transfer');
          setShowDialog(false);
          setFormData({
            tenant_id: '',
            property_id: '',
            room_id: '',
            amount: '',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'transfer',
            notes: '',
            proof_file: null
          });
          loadData();
        };
        reader.readAsDataURL(formData.proof_file);
      } else {
        await api.post('/payments', {
          tenant_id: formData.tenant_id,
          property_id: formData.property_id,
          room_id: formData.room_id,
          amount: parseFloat(formData.amount),
          payment_date: new Date(formData.payment_date).toISOString(),
          payment_method: formData.payment_method,
          notes: formData.notes
        });
        toast.success('Pembayaran berhasil dicatat');
        setShowDialog(false);
        setFormData({
          tenant_id: '',
          property_id: '',
          room_id: '',
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'transfer',
          notes: '',
          proof_file: null
        });
        loadData();
      }
    } catch (error) {
      toast.error('Gagal mencatat pembayaran');
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}/approve`);
      toast.success('Pembayaran disetujui');
      loadData();
    } catch (error) {
      toast.error('Gagal menyetujui pembayaran');
    }
  };

  const handleReject = async (paymentId) => {
    if (!window.confirm('Yakin ingin menolak pembayaran ini?')) return;
    try {
      await api.put(`/payments/${paymentId}/reject`);
      toast.success('Pembayaran ditolak');
      loadData();
    } catch (error) {
      toast.error('Gagal menolak pembayaran');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disetujui', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak', icon: XCircle }
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.bg} ${variant.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const approvedPayments = payments.filter(p => p.status === 'approved');
  const rejectedPayments = payments.filter(p => p.status === 'rejected');

  const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="payments-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pembayaran Sewa</h1>
            <p className="text-slate-600 mt-1">Kelola pembayaran dan verifikasi bukti transfer</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-blue-700 hover:bg-blue-800" data-testid="add-payment-btn">
            <Plus className="w-4 h-4 mr-2" />
            Catat Pembayaran Manual
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                  <p className="text-xs text-slate-500 mt-1">{approvedPayments.length} pembayaran disetujui</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                  <Clock className="w-4 h-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Menunggu verifikasi</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Ditolak</CardTitle>
                  <XCircle className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{rejectedPayments.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Pembayaran ditolak</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
                <TabsTrigger value="approved">Disetujui ({approvedPayments.length})</TabsTrigger>
                <TabsTrigger value="all">Semua ({payments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Card>
                  <CardContent className="pt-6">
                    {pendingPayments.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Tidak ada pembayaran pending</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Penghuni</TableHead>
                            <TableHead>Kamar</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingPayments.map((payment) => {
                            const tenant = tenants.find(t => t.id === payment.tenant_id);
                            const room = rooms.find(r => r.id === payment.room_id);
                            return (
                              <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                                <TableCell>
                                  <span className="font-medium text-slate-900">{tenant?.full_name || 'N/A'}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-slate-700">Kamar {room?.room_number || 'N/A'}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-slate-600">{format(new Date(payment.payment_date), 'dd MMM yyyy')}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold text-slate-900">Rp {payment.amount.toLocaleString('id-ID')}</span>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(payment.status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    {payment.proof_url && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(payment.proof_url, '_blank')}
                                      >
                                        <Upload className="w-4 h-4 mr-1" />
                                        Lihat Bukti
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApprove(payment.id)}
                                      data-testid={`approve-btn-${payment.id}`}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Setuju
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:bg-red-50"
                                      onClick={() => handleReject(payment.id)}
                                      data-testid={`reject-btn-${payment.id}`}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Tolak
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approved">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Penghuni</TableHead>
                          <TableHead>Kamar</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedPayments.map((payment) => {
                          const tenant = tenants.find(t => t.id === payment.tenant_id);
                          const room = rooms.find(r => r.id === payment.room_id);
                          return (
                            <TableRow key={payment.id}>
                              <TableCell>{tenant?.full_name || 'N/A'}</TableCell>
                              <TableCell>Kamar {room?.room_number || 'N/A'}</TableCell>
                              <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell>Rp {payment.amount.toLocaleString('id-ID')}</TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Penghuni</TableHead>
                          <TableHead>Kamar</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => {
                          const tenant = tenants.find(t => t.id === payment.tenant_id);
                          const room = rooms.find(r => r.id === payment.room_id);
                          return (
                            <TableRow key={payment.id}>
                              <TableCell>{tenant?.full_name || 'N/A'}</TableCell>
                              <TableCell>Kamar {room?.room_number || 'N/A'}</TableCell>
                              <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell>Rp {payment.amount.toLocaleString('id-ID')}</TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Manual</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="property_id">Properti</Label>
                <Select value={formData.property_id} onValueChange={(val) => setFormData({ ...formData, property_id: val, room_id: '', tenant_id: '' })} required>
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kamar" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.filter(r => r.property_id === formData.property_id).map((room) => (
                      <SelectItem key={room.id} value={room.id}>Kamar {room.room_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tenant_id">Penghuni</Label>
                <Select value={formData.tenant_id} onValueChange={(val) => setFormData({ ...formData, tenant_id: val })} required disabled={!formData.room_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penghuni" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.filter(t => t.room_id === formData.room_id).map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>{tenant.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Jumlah</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment_date">Tanggal</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="proof_file">Upload Bukti Transfer (Opsional)</Label>
                <Input
                  id="proof_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, proof_file: e.target.files[0] })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
              </div>
              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800">
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