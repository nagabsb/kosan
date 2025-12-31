import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Zap, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import api from '../lib/api';

export default function UtilityMeters() {
  const [meters, setMeters] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    property_id: '',
    meter_type: 'listrik',
    reading_date: new Date().toISOString().split('T')[0],
    current_reading: '',
    previous_reading: '',
    cost_per_unit: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metersRes, propsRes, roomsRes] = await Promise.all([
        api.get('/utility-meters'),
        api.get('/properties'),
        api.get('/rooms')
      ]);
      setMeters(metersRes.data);
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
      await api.post('/utility-meters', {
        ...formData,
        reading_date: new Date(formData.reading_date).toISOString(),
        current_reading: parseFloat(formData.current_reading),
        previous_reading: parseFloat(formData.previous_reading),
        cost_per_unit: parseFloat(formData.cost_per_unit)
      });
      toast.success('Meteran berhasil dicatat');
      setShowDialog(false);
      setFormData({
        room_id: '',
        property_id: '',
        meter_type: 'listrik',
        reading_date: new Date().toISOString().split('T')[0],
        current_reading: '',
        previous_reading: '',
        cost_per_unit: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      toast.error('Gagal mencatat meteran');
    }
  };

  const electricMeters = meters.filter(m => m.meter_type === 'listrik');
  const waterMeters = meters.filter(m => m.meter_type === 'air');

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="utility-meters-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meteran Listrik & Air</h1>
            <p className="text-slate-600 mt-1">Catat pembacaan meteran bulanan</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-blue-700 hover:bg-blue-800" data-testid="add-meter-btn">
            <Plus className="w-4 h-4 mr-2" />
            Catat Meteran
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Meteran Listrik</CardTitle>
                  <Zap className="w-4 h-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{electricMeters.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Total pencatatan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Meteran Air</CardTitle>
                  <Droplets className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{waterMeters.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Total pencatatan</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kamar</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pembacaan</TableHead>
                      <TableHead>Pemakaian</TableHead>
                      <TableHead>Biaya</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meters.map((meter) => {
                      const room = rooms.find(r => r.id === meter.room_id);
                      const usage = meter.current_reading - meter.previous_reading;
                      return (
                        <TableRow key={meter.id} data-testid={`meter-row-${meter.id}`}>
                          <TableCell>
                            <span className="font-medium text-slate-900">Kamar {room?.room_number || 'N/A'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {meter.meter_type === 'listrik' ? (
                                <Zap className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <Droplets className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="capitalize">{meter.meter_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600">{format(new Date(meter.reading_date), 'dd MMM yyyy')}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-slate-600">Sebelum: {meter.previous_reading}</div>
                              <div className="text-slate-900 font-medium">Sekarang: {meter.current_reading}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-blue-700">{usage} unit</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-900">Rp {meter.total_cost.toLocaleString('id-ID')}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Meteran Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="property_id">Properti</Label>
                <Select value={formData.property_id} onValueChange={(val) => setFormData({ ...formData, property_id: val, room_id: '' })} required>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="meter_type">Jenis Meteran</Label>
                  <Select value={formData.meter_type} onValueChange={(val) => setFormData({ ...formData, meter_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listrik">Listrik</SelectItem>
                      <SelectItem value="air">Air</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="reading_date">Tanggal Pembacaan</Label>
                <Input
                  id="reading_date"
                  type="date"
                  value={formData.reading_date}
                  onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="previous_reading">Pembacaan Sebelumnya</Label>
                  <Input
                    id="previous_reading"
                    type="number"
                    step="0.01"
                    value={formData.previous_reading}
                    onChange={(e) => setFormData({ ...formData, previous_reading: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="current_reading">Pembacaan Sekarang</Label>
                  <Input
                    id="current_reading"
                    type="number"
                    step="0.01"
                    value={formData.current_reading}
                    onChange={(e) => setFormData({ ...formData, current_reading: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cost_per_unit">Biaya Per Unit (Rp)</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                  required
                  placeholder="Contoh: 1500"
                />
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