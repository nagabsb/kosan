import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function Canteen() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  
  const [productForm, setProductForm] = useState({
    property_id: '',
    name: '',
    price: '',
    stock: '',
    category: 'makanan'
  });

  const [transactionForm, setTransactionForm] = useState({
    property_id: '',
    product_id: '',
    tenant_id: '',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, transactionsRes, salesRes, propsRes, tenantsRes] = await Promise.all([
        api.get('/canteen/products'),
        api.get('/canteen/transactions'),
        api.get('/canteen/sales-report'),
        api.get('/properties'),
        api.get('/tenants')
      ]);
      setProducts(productsRes.data);
      setTransactions(transactionsRes.data);
      setSalesReport(salesRes.data);
      setProperties(propsRes.data);
      setTenants(tenantsRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/canteen/products', {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      });
      toast.success('Produk berhasil ditambahkan');
      setShowProductDialog(false);
      setProductForm({ property_id: '', name: '', price: '', stock: '', category: 'makanan' });
      loadData();
    } catch (error) {
      toast.error('Gagal menambahkan produk');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/canteen/transactions', {
        ...transactionForm,
        quantity: parseInt(transactionForm.quantity)
      });
      toast.success('Transaksi berhasil dicatat');
      setShowTransactionDialog(false);
      setTransactionForm({ property_id: '', product_id: '', tenant_id: '', quantity: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error('Gagal mencatat transaksi');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="canteen-page">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kantin Kost</h1>
          <p className="text-slate-600 mt-1">Kelola produk dan transaksi kantin</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">Rp {(salesReport?.total_revenue || 0).toLocaleString('id-ID')}</div>
                  <p className="text-xs text-slate-500 mt-1">Total pendapatan kantin</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Transaksi</CardTitle>
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{salesReport?.total_transactions || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Jumlah transaksi</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Produk</CardTitle>
                  <Package className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{products.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Produk terdaftar</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="products" className="w-full">
              <TabsList>
                <TabsTrigger value="products">Produk</TabsTrigger>
                <TabsTrigger value="transactions">Transaksi</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Daftar Produk</h2>
                  <Button onClick={() => setShowProductDialog(true)} className="bg-blue-700 hover:bg-blue-800" data-testid="add-product-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Produk
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} data-testid={`product-card-${product.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{product.name}</h3>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{product.category}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-blue-700">Rp {product.price.toLocaleString('id-ID')}</p>
                          <p className="text-sm text-slate-600">Stok: <span className="font-medium">{product.stock}</span></p>
                          <div className={`inline-block px-2 py-1 rounded text-xs ${
                            product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.is_available ? 'Tersedia' : 'Habis'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Riwayat Transaksi</h2>
                  <Button onClick={() => setShowTransactionDialog(true)} className="bg-blue-700 hover:bg-blue-800" data-testid="add-transaction-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Catat Transaksi
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {transactions.map((trans) => {
                        const product = products.find(p => p.id === trans.product_id);
                        return (
                          <div key={trans.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg" data-testid={`transaction-${trans.id}`}>
                            <div>
                              <p className="font-medium text-slate-900">{product?.name || 'Produk tidak ditemukan'}</p>
                              <p className="text-sm text-slate-600">Qty: {trans.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-blue-700">Rp {trans.total_price.toLocaleString('id-ID')}</p>
                              <p className="text-xs text-slate-500">{new Date(trans.transaction_date).toLocaleDateString('id-ID')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <Label htmlFor="property_id">Properti</Label>
                <Select value={productForm.property_id} onValueChange={(val) => setProductForm({ ...productForm, property_id: val })} required>
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
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={productForm.category} onValueChange={(val) => setProductForm({ ...productForm, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="makanan">Makanan</SelectItem>
                    <SelectItem value="minuman">Minuman</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowProductDialog(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800">
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Transaksi Kantin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <Label htmlFor="trans_property">Properti</Label>
                <Select value={transactionForm.property_id} onValueChange={(val) => setTransactionForm({ ...transactionForm, property_id: val })} required>
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
                <Label htmlFor="product_id">Produk</Label>
                <Select value={transactionForm.product_id} onValueChange={(val) => setTransactionForm({ ...transactionForm, product_id: val })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.property_id === transactionForm.property_id && p.is_available).map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>{prod.name} - Rp {prod.price.toLocaleString('id-ID')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tenant_id">Penghuni (Opsional)</Label>
                <Select value={transactionForm.tenant_id} onValueChange={(val) => setTransactionForm({ ...transactionForm, tenant_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penghuni (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.filter(t => t.property_id === transactionForm.property_id).map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>{tenant.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Jumlah</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={transactionForm.quantity}
                  onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTransactionDialog(false)}>
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