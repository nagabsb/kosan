import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import api from '../lib/api';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    tenant_id: '',
    property_id: '',
    room_id: '',
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [complaintsRes, propsRes, roomsRes, tenantsRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/properties'),
        api.get('/rooms'),
        api.get('/tenants')
      ]);
      setComplaints(complaintsRes.data);
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
      await api.post('/complaints', formData);
      toast.success('Keluhan berhasil dicatat');
      setShowDialog(false);
      setFormData({
        tenant_id: '',
        property_id: '',
        room_id: '',
        title: '',
        description: '',
        priority: 'medium'
      });
      loadData();
    } catch (error) {
      toast.error('Gagal mencatat keluhan');
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await api.put(`/complaints/${complaintId}/status?status=${newStatus}`);
      toast.success('Status keluhan diupdate');
      loadData();
    } catch (error) {
      toast.error('Gagal mengupdate status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: { bg: 'bg-red-100', text: 'text-red-700', label: 'Baru', icon: AlertCircle },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Proses', icon: Clock },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai', icon: CheckCircle }
    };
    const variant = variants[status] || variants.open;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.bg} ${variant.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    const labels = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi'
    };
    return <Badge className={variants[priority]}>{labels[priority]}</Badge>;
  };

  const openComplaints = complaints.filter(c => c.status === 'open');
  const inProgressComplaints = complaints.filter(c => c.status === 'in_progress');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="complaints-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Keluhan & Maintenance</h1>
            <p className="text-slate-600 mt-1">Kelola keluhan dan request maintenance dari penghuni</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-blue-700 hover:bg-blue-800" data-testid="add-complaint-btn">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Keluhan
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Keluhan Baru</CardTitle>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{openComplaints.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Perlu ditangani</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Dalam Proses</CardTitle>
                  <Clock className="w-4 h-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{inProgressComplaints.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Sedang ditangani</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Selesai</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{resolvedComplaints.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Sudah diselesaikan</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="open" className="w-full">
              <TabsList>
                <TabsTrigger value="open">Baru ({openComplaints.length})</TabsTrigger>
                <TabsTrigger value="in_progress">Proses ({inProgressComplaints.length})</TabsTrigger>
                <TabsTrigger value="resolved">Selesai ({resolvedComplaints.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="open">
                <div className="space-y-4">
                  {openComplaints.map((complaint) => {
                    const tenant = tenants.find(t => t.id === complaint.tenant_id);
                    const room = rooms.find(r => r.id === complaint.room_id);
                    return (
                      <Card key={complaint.id} data-testid={`complaint-${complaint.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-slate-900">{complaint.title}</h3>
                                {getPriorityBadge(complaint.priority)}
                                {getStatusBadge(complaint.status)}
                              </div>
                              <p className="text-slate-600 mb-3">{complaint.description}</p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>Penghuni: <span className="font-medium text-slate-900">{tenant?.full_name || 'N/A'}</span></span>
                                <span>Kamar: <span className="font-medium text-slate-900">{room?.room_number || 'N/A'}</span></span>
                                <span>{format(new Date(complaint.created_at), 'dd MMM yyyy HH:mm')}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-yellow-600 hover:bg-yellow-700"
                                onClick={() => handleUpdateStatus(complaint.id, 'in_progress')}
                              >
                                Proses
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleUpdateStatus(complaint.id, 'resolved')}
                              >
                                Selesai
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {openComplaints.length === 0 && (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center">
                        <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Tidak ada keluhan baru</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="in_progress">
                <div className="space-y-4">
                  {inProgressComplaints.map((complaint) => {
                    const tenant = tenants.find(t => t.id === complaint.tenant_id);
                    const room = rooms.find(r => r.id === complaint.room_id);
                    return (
                      <Card key={complaint.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-slate-900">{complaint.title}</h3>
                                {getPriorityBadge(complaint.priority)}
                                {getStatusBadge(complaint.status)}
                              </div>
                              <p className="text-slate-600 mb-3">{complaint.description}</p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>Penghuni: <span className="font-medium text-slate-900">{tenant?.full_name || 'N/A'}</span></span>
                                <span>Kamar: <span className="font-medium text-slate-900">{room?.room_number || 'N/A'}</span></span>
                                <span>{format(new Date(complaint.created_at), 'dd MMM yyyy HH:mm')}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleUpdateStatus(complaint.id, 'resolved')}
                            >
                              Selesai
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="resolved">
                <div className="space-y-4">
                  {resolvedComplaints.map((complaint) => {
                    const tenant = tenants.find(t => t.id === complaint.tenant_id);
                    const room = rooms.find(r => r.id === complaint.room_id);
                    return (
                      <Card key={complaint.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-slate-900">{complaint.title}</h3>
                            {getPriorityBadge(complaint.priority)}
                            {getStatusBadge(complaint.status)}
                          </div>
                          <p className="text-slate-600 mb-3">{complaint.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Penghuni: <span className="font-medium text-slate-900">{tenant?.full_name || 'N/A'}</span></span>
                            <span>Kamar: <span className="font-medium text-slate-900">{room?.room_number || 'N/A'}</span></span>
                            <span>{format(new Date(complaint.created_at), 'dd MMM yyyy HH:mm')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Keluhan Baru</DialogTitle>
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
                <Select value={formData.room_id} onValueChange={(val) => setFormData({ ...formData, room_id: val, tenant_id: '' })} required disabled={!formData.property_id}>
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
              <div>
                <Label htmlFor="title">Judul Keluhan</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: AC tidak dingin"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail keluhan..."
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="priority">Prioritas</Label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                  </SelectContent>
                </Select>
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