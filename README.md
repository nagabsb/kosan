# ManageKost - Sistem Management Kost Modern

Aplikasi management kost berbasis web untuk pemilik kost di Indonesia.

## Fitur Utama

### 1. **Multi-Property Management**
- Kelola banyak properti kost dalam satu dashboard
- Auto-create properti saat registrasi

### 2. **Manajemen Kamar**
- CRUD kamar dengan status (Available/Occupied/Maintenance)
- Set harga, fasilitas, dan foto kamar

### 3. **Manajemen Penghuni**
- Database lengkap penghuni dengan KTP dan kontak
- Tracking pembayaran dan deposit
- Riwayat check-in/check-out

### 4. **Kantin Kost**
- Kelola produk jualan kantin (makanan, minuman, snack)
- Catat transaksi penjualan
- Laporan revenue kantin

### 5. **Pengelola Kost (Role Management)**
- Tambah pengelola/staff dengan akses terbatas
- Set permissions (manage rooms, tenants)
- Role-based dashboard

### 6. **Dashboard Analytics**
- Occupancy rate real-time
- Total revenue
- Pembayaran pending
- Keluhan terbuka

## Tech Stack

- **Backend**: FastAPI (Python 3.9+)
- **Frontend**: React 18 + TailwindCSS
- **Database**: MongoDB
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Charts**: Recharts

## Quick Start untuk Development

```bash
# Backend
cd backend
pip install -r requirements.txt
python server.py

# Frontend (terminal baru)
cd frontend
yarn install
yarn start
```

## Deployment ke Hosting

Lihat **[DEPLOYMENT.md](/app/DEPLOYMENT.md)** untuk panduan lengkap deployment ke production.

### Quick Deploy Steps:
1. Setup MongoDB Atlas (free tier tersedia)
2. Deploy backend ke Railway/Render
3. Deploy frontend ke Vercel
4. Done! 🚀

## Environment Variables

Lihat **[.env.example](/.env.example)** untuk daftar lengkap environment variables.

## License

Proprietary - All rights reserved
