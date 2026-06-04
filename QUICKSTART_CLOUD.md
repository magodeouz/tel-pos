# Hızlı Başlangıç — Cloud Deploy

## 60 saniyede Cloudflare'de canlı yap

### 1. Cloudflare Hesabı
https://dash.cloudflare.com → Sign up (free)

### 2. Terminal
```bash
npm install -g wrangler
wrangler login
cd /path/to/tel-pos
```

### 3. Veritabanı
```bash
wrangler d1 create tel-pos-db
```

Output'tan `database_id` kopyala.

### 4. wrangler.toml Güncelle
```toml
[[d1_databases]]
database_id = "BURAYA_KOPYALA"  # ← Burayı değiştir
```

### 5. Deploy!
```bash
wrangler deploy
```

✅ Bitti! URL çıktıda görünecek:
```
https://tel-pos.workers.dev
```

### 6. Android Ayarla
MainActivity → IP = `tel-pos.workers.dev`

### Test
Browser açarak: `https://tel-pos.workers.dev` → POS ekranı açılır

Telefon çal → "Gelen Arama" modalı ↓ → ✅

---

## Eğer Error alırsan

**"Module not found: app"**
→ `asgi.py` root'ta olmalı (✅ zaten var)

**"D1 connection failed"**
→ `database_id` doğru mu? wrangler.toml'de kontrol et

**"WebSocket timeout"**
→ Browser → F12 → Network → WS → check headers

---

## Daha Fazla Bilgi
→ [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md)
