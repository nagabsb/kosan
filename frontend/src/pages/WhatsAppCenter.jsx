import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, QrCode, Send, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function WhatsAppCenter() {
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    message: ''
  });
  const [broadcastForm, setBroadcastForm] = useState({
    property_id: '',
    message: ''
  });
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadData();
    checkWhatsAppStatus();
  }, []);

  const loadData = async () => {
    try {
      const [propsRes, tenantsRes] = await Promise.all([
        api.get('/properties'),
        api.get('/tenants')
      ]);
      setProperties(propsRes.data);
      setTenants(tenantsRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    }
  };

  const checkWhatsAppStatus = () => {
    setWhatsappStatus('disconnected');
  };

  const handleConnectWhatsApp = () => {
    setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=whatsapp-web-simulation');
    toast.info('Scan QR code dengan WhatsApp Anda');
    
    setTimeout(() => {
      setWhatsappStatus('connected');
      setQrCode(null);
      toast.success('WhatsApp berhasil terhubung!');
    }, 5000);
  };

  const handleDisconnect = () => {
    setWhatsappStatus('disconnected');
    toast.success('WhatsApp disconnected');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (whatsappStatus !== 'connected') {
      toast.error('WhatsApp belum terhubung');
      return;
    }
    
    toast.success(`Pesan berhasil dikirim ke ${messageForm.recipient}`);
    setMessageForm({ recipient: '', message: '' });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (whatsappStatus !== 'connected') {
      toast.error('WhatsApp belum terhubung');
      return;
    }

    const selectedTenants = tenants.filter(t => t.property_id === broadcastForm.property_id);
    
    toast.success(`Broadcast berhasil dikirim ke ${selectedTenants.length} penghuni`);
    setBroadcastForm({ property_id: '', message: '' });
  };

  const messageTemplates = [
    {
      name: 'Reminder Pembayaran',
      message: 'Halo {nama}, ini adalah pengingat bahwa pembayaran sewa bulan ini jatuh tempo pada {tanggal}. Mohon segera melakukan pembayaran. Terima kasih!'
    },
    {
      name: 'Konfirmasi Pembayaran',
      message: 'Halo {nama}, pembayaran sewa Anda untuk bulan {bulan} telah kami terima dan disetujui. Terima kasih!'
    },
    {
      name: 'Update Keluhan',
      message: 'Halo {nama}, keluhan Anda terkait {judul} telah kami proses dan akan segera diselesaikan. Terima kasih atas kesabarannya.'
    },
    {
      name: 'Pengumuman Umum',
      message: 'Halo para penghuni, kami ingin menginformasikan bahwa {informasi}. Terima kasih atas perhatiannya.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="whatsapp-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">WhatsApp Center</h1>
          <p className="text-slate-600 mt-1">Kirim pesan dan reminder otomatis ke penghuni via WhatsApp</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Status WhatsApp</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${whatsappStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-slate-600">
                      {whatsappStatus === 'connected' ? 'Terhubung' : 'Tidak terhubung'}
                    </span>
                  </div>
                </div>
              </div>
              {whatsappStatus === 'disconnected' ? (
                <Button onClick={handleConnectWhatsApp} className="bg-green-600 hover:bg-green-700">
                  <QrCode className="w-4 h-4 mr-2" />
                  Hubungkan WhatsApp
                </Button>
              ) : (
                <Button variant="outline" onClick={handleDisconnect} className="text-red-600 hover:bg-red-50">
                  Putuskan Koneksi
                </Button>
              )}
            </div>

            {qrCode && (
              <div className="mt-6 p-6 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-600 mb-4">Scan QR Code ini dengan WhatsApp Anda:</p>
                <img src={qrCode} alt="QR Code" className="mx-auto w-64 h-64" />
                <p className="text-xs text-slate-500 mt-4">
                  Buka WhatsApp → Menu (⋮) → Perangkat Tertaut → Tautkan Perangkat
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {whatsappStatus === 'connected' && (
          <Tabs defaultValue="send" className="w-full">
            <TabsList>
              <TabsTrigger value="send">Kirim Pesan</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              <TabsTrigger value="templates">Template</TabsTrigger>
            </TabsList>

            <TabsContent value="send">
              <Card>
                <CardHeader>
                  <CardTitle>Kirim Pesan ke Penghuni</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <Label htmlFor="recipient">Penerima</Label>
                      <Select 
                        value={messageForm.recipient} 
                        onValueChange={(val) => setMessageForm({ ...messageForm, recipient: val })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih penghuni" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.phone}>
                              {tenant.full_name} - {tenant.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="message">Pesan</Label>
                      <Textarea
                        id="message"
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                        placeholder="Tulis pesan Anda..."
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Pesan
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="broadcast">
              <Card>
                <CardHeader>
                  <CardTitle>Broadcast ke Semua Penghuni</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBroadcast} className="space-y-4">
                    <div>
                      <Label htmlFor="property_id">Properti</Label>
                      <Select 
                        value={broadcastForm.property_id} 
                        onValueChange={(val) => setBroadcastForm({ ...broadcastForm, property_id: val })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih properti" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((prop) => {
                            const tenantCount = tenants.filter(t => t.property_id === prop.id).length;
                            return (
                              <SelectItem key={prop.id} value={prop.id}>
                                {prop.name} ({tenantCount} penghuni)
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="broadcast_message">Pesan Broadcast</Label>
                      <Textarea
                        id="broadcast_message"
                        value={broadcastForm.message}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                        placeholder="Tulis pesan broadcast..."
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Users className="w-4 h-4 mr-2" />
                      Kirim Broadcast
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messageTemplates.map((template, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-slate-600 mb-4">{template.message}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMessageForm({ ...messageForm, message: template.message })}
                      >
                        Gunakan Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {whatsappStatus === 'disconnected' && !qrCode && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">WhatsApp Belum Terhubung</h3>
              <p className="text-slate-600 mb-6">
                Hubungkan WhatsApp Anda untuk mulai mengirim pesan dan reminder otomatis
              </p>
              <Button onClick={handleConnectWhatsApp} className="bg-green-600 hover:bg-green-700">
                <QrCode className="w-4 h-4 mr-2" />
                Hubungkan Sekarang
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
