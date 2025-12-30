import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, BedDouble, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    room_number: '',
    room_type: '',
    price: '',
    facilities: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, propsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/properties')
      ]);
      setRooms(roomsRes.data);
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
      await api.post('/rooms', {
        ...formData,
        price: parseFloat(formData.price)
      });
      toast.success('Kamar berhasil ditambahkan');
      setShowDialog(false);
      setFormData({ property_id: '', room_number: '', room_type: '', price: '', facilities: [] });
      loadData();
    } catch (error) {
      toast.error('Gagal menambahkan kamar');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'bg-green-100 text-green-700',
      occupied: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-orange-100 text-orange-700'
    };
    const labels = {
      available: 'Tersedia',
      occupied: 'Terisi',
      maintenance: 'Maintenance'
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="rooms-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Kamar</h1>
            <p className="text-slate-600 mt-1">Kelola kamar di semua properti</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-cyan-600 hover:bg-cyan-700" data-testid="add-room-btn">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kamar
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} data-testid={`room-card-${room.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <BedDouble className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Kamar {room.room_number}</h3>
                        <p className="text-sm text-slate-500">{room.room_type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">Rp {room.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      {getStatusBadge(room.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kamar Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="property_id">Properti</Label>
                <Select value={formData.property_id} onValueChange={(val) => setFormData({ ...formData, property_id: val })} required>
                  <SelectTrigger data-testid="room-property-select">
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
                <Label htmlFor="room_number">Nomor Kamar</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="101"
                  required
                  data-testid="room-number-input"
                />
              </div>
              <div>
                <Label htmlFor="room_type">Tipe Kamar</Label>
                <Input
                  id="room_type"
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  placeholder="Standard / Deluxe"
                  required
                  data-testid="room-type-input"
                />
              </div>
              <div>
                <Label htmlFor="price">Harga per Bulan</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1000000"
                  required
                  data-testid="room-price-input"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700" data-testid="room-submit-btn">
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