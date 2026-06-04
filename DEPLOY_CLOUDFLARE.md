# Tel-POS Cloud Deployment — Cloudflare Workers

## Ön Koşullar

- Cloudflare hesabı ([cloudflare.com](https://cloudflare.com))
- npm/node yüklü
- Wrangler CLI (`npm install -g wrangler`)

## Setup Adımları

### 1. Wrangler Kurulum ve Login

```bash
npm install -g wrangler
wrangler login
```

### 2. D1 Veritabanı Oluştur

```bash
wrangler d1 create tel-pos-db
```

**Çıktı:**
```
✓ Created database tel-pos-db (abc123def456)
Add the following to your wrangler.toml:

[[d1_databases]]
binding = "DB"
database_name = "tel-pos-db"
database_id = "abc123def456"
```

Database ID'yi not et (wrangler.toml'de gerekli).

### 3. wrangler.toml Ayarla

```toml
name = "tel-pos"
type = "python"
main = "asgi.py"
compatibility_date = "2024-06-05"

[[d1_databases]]
binding = "DB"
database_name = "tel-pos-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Veritabanı Migrasyonu

```bash
wrangler d1 execute tel-pos-db --file=/dev/stdin < <(
  python -c "
from app.models import Base
from app.database import engine
# Create tables
Base.metadata.create_all(bind=engine)
print('Tables created')
"
)
```

### 5. Deploy

```bash
wrangler deploy
```

**Çıktı:**
```
✓ Uploading tel-pos (0.5MB)
✓ Successfully published your Worker to:
  https://tel-pos.workers.dev
```

## Android APK Ayarları

MainActivity'de:
- **IP Address**: `tel-pos.workers.dev`
- **Port**: `443` (HTTPS)

Veya özel domain varsa:
- **IP Address**: `api.telpos.com`

## WebSocket Bağlantısı

Frontend (browser) otomatik olarak WebSocket'i şu adresten açar:
- `wss://tel-pos.workers.dev/ws` (secure WebSocket)

## Environment Variables

Başlangıç seed data için:

```bash
wrangler secret put RESTAURANT_NAME
# İsim gir: "Örnek Restoran"
```

## Monitoring

```bash
# Real-time logs
wrangler tail tel-pos

# Database stats
wrangler d1 info tel-pos-db
```

## Troubleshooting

### "Connection refused" — Android

- Domain/IP doğru mu? (tip: `https://` gerekli)
- Telefonda internet bağlantısı var mı?
- Firewall blokluyorsa domain whitelist'e ekle

### WebSocket bağlantısı açılmıyor

- Browser console'da check et (`F12 → Console`)
- URL: `wss://tel-pos.workers.dev/ws` olmalı
- HTTPS bağlantı gereklidir

### D1 hata

```bash
# Database reset
wrangler d1 execute tel-pos-db --command "DELETE FROM orders"
```

## Production Scaling

Ücretsiz tier limits:
- **Requests**: 100,000/gün
- **D1 Database**: 5GB
- **Binding çağrıları**: Sınırsız

Daha fazla ihtiyaç olursa → Cloudflare Workers Paid Plan

## Yedek (Backup)

```bash
# D1 veritabanını export et
wrangler d1 execute tel-pos-db --command "SELECT * FROM customers" > backup.sql
```

## Custom Domain

Cloudflare domain kaydı sonrası:

```toml
routes = [
  { pattern = "api.telpos.com/*", zone_id = "your-zone-id" }
]
```

`wrangler deploy` sonrası DNS ayarları otomatik.
