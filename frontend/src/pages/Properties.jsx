import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, MapPin, BedDouble, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    total_rooms: '',
    description: '',
    facilities: []
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      toast.error('Gagal memuat data properti');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && selectedProperty) {
        // Update existing property
        await api.put(`/properties/${selectedProperty.id}`, {
          ...formData,
          total_rooms: parseInt(formData.total_rooms)
        });
        toast.success('Properti berhasil diupdate');
      } else {
        // Create new property
        await api.post('/properties', {
          ...formData,
          total_rooms: parseInt(formData.total_rooms)
        });
        toast.success('Properti berhasil ditambahkan');
      }
      setShowDialog(false);
      setEditMode(false);
      setSelectedProperty(null);
      setFormData({ name: '', address: '', total_rooms: '', description: '', facilities: [] });
      loadProperties();
    } catch (error) {
      toast.error(editMode ? 'Gagal mengupdate properti' : 'Gagal menambahkan properti');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus properti ini?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Properti berhasil dihapus');
      loadProperties();
    } catch (error) {
      toast.error('Gagal menghapus properti');
    }
  };

  const handleEdit = (property) => {
    setEditMode(true);
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      total_rooms: property.total_rooms.toString(),
      description: property.description || '',
      facilities: property.facilities || []
    });
    setShowDialog(true);
  };

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedProperty(null);
    setFormData({ name: '', address: '', total_rooms: '', description: '', facilities: [] });
    setShowDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="properties-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Properti</h1>
            <p className="text-slate-600 mt-1">Kelola semua properti kost Anda</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-700 hover:bg-blue-800" data-testid="add-property-btn">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Properti
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum ada properti</h3>
              <p className="text-slate-600 mb-6">Mulai dengan menambahkan properti kost pertama Anda</p>
              <Button onClick={handleAddNew} className="bg-blue-700 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Properti
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow" data-testid={`property-card-${property.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{property.name}</h3>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{property.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BedDouble className="w-4 h-4" />
                    <span>{property.total_rooms} kamar</span>
                  </div>
                  {property.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{property.description}</p>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(property)} data-testid={`edit-property-${property.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(property.id)} data-testid={`delete-property-${property.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Properti' : 'Tambah Properti Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Properti</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kost Melati"
                  required
                  data-testid="property-name-input"
                />
              </div>
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Contoh No. 123"
                  required
                  data-testid="property-address-input"
                />
              </div>
              <div>
                <Label htmlFor="total_rooms">Jumlah Kamar</Label>
                <Input
                  id="total_rooms"
                  type="number"
                  value={formData.total_rooms}
                  onChange={(e) => setFormData({ ...formData, total_rooms: e.target.value })}
                  placeholder="10"
                  required
                  data-testid="property-rooms-input"
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi properti..."
                  data-testid="property-description-input"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setShowDialog(false);
                  setEditMode(false);
                  setSelectedProperty(null);
                }}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800" data-testid="property-submit-btn">
                  {editMode ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}