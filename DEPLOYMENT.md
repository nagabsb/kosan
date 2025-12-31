# Panduan Deployment ManageKost ke Hosting

## Persiapan

### 1. Database (MongoDB Atlas)

1. Buat akun di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster baru (Free tier M0 tersedia)
3. Setup Database Access:
   - Create database user dengan username dan password
   - Note credentials ini
4. Setup Network Access:
   - Add IP Address: `0.0.0.0/0` (allow from anywhere) untuk production
   - Atau whitelist IP hosting server Anda
5. Get Connection String:
   - Click "Connect" → "Connect your application"
   - Copy connection string, contoh:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Backend Deployment (Railway/Render)

#### Option A: Railway (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login ke Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   cd backend
   railway init
   ```

4. Set environment variables:
   ```bash
   railway variables set MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
   railway variables set DB_NAME="managekost"
   railway variables set JWT_SECRET_KEY="random-secret-key-production"
   railway variables set CORS_ORIGINS="https://your-frontend-domain.com"
   ```

5. Deploy:
   ```bash
   railway up
   ```

6. Get deployment URL:
   ```bash
   railway domain
   ```
   Contoh: `https://managekost-backend-production.up.railway.app`

#### Option B: Render

1. Push code ke GitHub
2. Buat akun di [Render](https://render.com)
3. Create Web Service → Connect repository
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables di dashboard:
   - `MONGO_URL`
   - `DB_NAME`
   - `JWT_SECRET_KEY`
   - `CORS_ORIGINS`

### 3. Frontend Deployment (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Build frontend:
   ```bash
   cd frontend
   
   # Set environment variable untuk build
   export REACT_APP_BACKEND_URL=https://your-backend-url.com
   
   # atau tambahkan ke .env.production
   echo "REACT_APP_BACKEND_URL=https://your-backend-url.com" > .env.production
   
   yarn build
   ```

3. Deploy ke Vercel:
   ```bash
   vercel --prod
   ```

4. Atau deploy via GitHub:
   - Push code ke GitHub
   - Connect repository di [Vercel Dashboard](https://vercel.com)
   - Set Environment Variables:
     - `REACT_APP_BACKEND_URL`: URL backend dari Railway/Render

## Checklist Deployment

### Pre-deployment
- [ ] MongoDB Atlas cluster dibuat dan accessible
- [ ] Database user dan password dibuat
- [ ] Connection string MongoDB sudah didapat
- [ ] Backend code sudah di push ke GitHub (optional)
- [ ] Frontend code sudah di push ke GitHub (optional)

### Backend Deployment
- [ ] Environment variables diset:
  - [ ] `MONGO_URL`
  - [ ] `DB_NAME`
  - [ ] `JWT_SECRET_KEY`
  - [ ] `CORS_ORIGINS`
- [ ] Backend service running dan accessible
- [ ] Test API endpoint: `curl https://backend-url.com/api/auth/me`

### Frontend Deployment
- [ ] Environment variable `REACT_APP_BACKEND_URL` diset
- [ ] Build frontend berhasil tanpa error
- [ ] Frontend deployed dan accessible
- [ ] CORS sudah allow frontend domain di backend

### Post-deployment Testing
- [ ] Buka aplikasi di browser
- [ ] Test register user baru
- [ ] Test login
- [ ] Test create property
- [ ] Test create room
- [ ] Test create tenant
- [ ] Test kantin features
- [ ] Test pengelola features

## Troubleshooting

### Error: CORS Policy
**Problem**: Frontend tidak bisa akses backend
**Solution**: Pastikan `CORS_ORIGINS` di backend include frontend domain
```
CORS_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com
```

### Error: MongoDB Connection Failed
**Problem**: Backend tidak bisa connect ke MongoDB
**Solution**: 
1. Check MongoDB Atlas Network Access
2. Pastikan IP server di-whitelist atau gunakan `0.0.0.0/0`
3. Verify connection string benar

### Error: 502 Bad Gateway
**Problem**: Backend service crash atau tidak running
**Solution**: Check backend logs di hosting dashboard

### Error: Build Failed
**Problem**: Frontend build error
**Solution**: 
1. Test build locally: `yarn build`
2. Fix any errors
3. Make sure all dependencies in `package.json`

## Monitoring

### Backend Logs
- Railway: `railway logs`
- Render: Check logs di dashboard

### Frontend Errors
- Check browser console
- Setup error tracking dengan Sentry (optional)

### Database
- MongoDB Atlas → Metrics tab
- Monitor connections, operations, storage

## Maintenance

### Backup Database
```bash
# Export database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/managekost"

# Import database
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/managekost" dump/
```

### Update Application
```bash
# Backend
cd backend
railway up

# Frontend
cd frontend
vercel --prod
```

## Custom Domain (Optional)

### Backend Custom Domain
1. Buy domain (Namecheap, GoDaddy, Cloudflare)
2. Add domain di Railway/Render dashboard
3. Update DNS records (CNAME to hosting)
4. Wait for SSL certificate provisioning

### Frontend Custom Domain
1. Add domain di Vercel dashboard
2. Update DNS records as instructed
3. Update `CORS_ORIGINS` di backend dengan domain baru

## Estimasi Biaya Hosting

### Free Tier (Development/MVP)
- MongoDB Atlas: Free (M0 - 512MB)
- Railway: $5/month credit (enough untuk backend kecil)
- Vercel: Free (100GB bandwidth/month)
- **Total: ~$0-5/month**

### Production (Paid)
- MongoDB Atlas: $9/month (M2 - 2GB)
- Railway: $20/month (4GB RAM, 4 vCPU)
- Vercel: Free atau Pro $20/month
- **Total: ~$29-49/month**

## Support

Jika ada masalah saat deployment, hubungi support atau cek dokumentasi hosting:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
