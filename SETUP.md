# Tel-POS — Kurulum ve Dağıtım Rehberi

## 🚀 Başlangıç (5 dakika)

### Local Test (Python + SQLite)

```bash
cd /path/to/tel-pos

# Python kurulumu
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Sunucu başlat
python -m uvicorn app.main:app --reload
```

Browser: http://localhost:8000
Admin: http://localhost:8000/admin

---

## 📱 Android APK Kurulum

### macOS/Linux

```bash
cd android

# Gradle'ı kur (ilk kez)
brew install gradle openjdk@17

# Build et
export JAVA_HOME=$(brew --prefix openjdk@17)
gradle assembleDebug

# APK bulunur
ls app/build/outputs/apk/debug/app-debug.apk
```

### Android'e Yükle
1. USB kablosu veya emülatör bağla
2. APK'yı aç → Install
3. Settings'te server IP gir (örn: `192.168.1.5:8000`)

---

## ☁️ Cloud Deploy (Cloudflare)

### Ön Koşullar
- Cloudflare account (free) https://cloudflare.com
- npm yüklü

### 1 dakikada deploy et

```bash
npm install -g wrangler
wrangler login
cd tel-pos

wrangler d1 create tel-pos-db
# Output'tan database_id kopyala

# wrangler.toml'de database_id güncelle
nano wrangler.toml
# [[d1_databases]]
# database_id = "BURAYA_KOPYALA"

wrangler deploy
```

✅ URL: `https://tel-pos.workers.dev`

### Android Ayarla
- Settings → IP: `tel-pos.workers.dev`
- Port: `443`

---

## 🐳 Docker (Production)

```bash
# Sunucu imajı
docker build -t tel-pos-server .
docker run -p 8000:8000 tel-pos-server

# APK build
docker build -f Dockerfile.android -t tel-pos-apk .
docker run --rm -v $(pwd)/android/app/build:/app/app/build tel-pos-apk
```

---

## 🧪 Test

### Local POS
```bash
# Terminal 1: Sunucu
python -m uvicorn app.main:app --reload

# Terminal 2: Gelen arama simülasyonu
curl -X POST http://localhost:8000/api/incoming-call \
  -H "Content-Type: application/json" \
  -d '{"phone":"05551234567"}'
```

### Cloud POS
```bash
# Aynı komut, başka URL
curl -X POST https://tel-pos.workers.dev/api/incoming-call \
  -H "Content-Type: application/json" \
  -d '{"phone":"05551234567"}'
```

---

## 📊 Komut Özeti

| Görev | Komut |
|-------|--------|
| Dev sunucu | `uvicorn app.main:app --reload` |
| APK build | `gradle assembleDebug` |
| Admin paneli | http://localhost:8000/admin |
| Cloudflare deploy | `wrangler deploy` |
| API test | `curl -X POST http://...` |
| Yazıcı test | `GET /api/printer/status` |

---

## 🆘 Sorunlar

### "Yazıcı bağlı değil"
→ Windows: Zadig'ten WinUSB driver yükle
→ macOS/Linux: CUPS printer setup

### "WebSocket bağlanamıyor"
→ Browser F12 → Console
→ HTTPS gerekli (https://...)

### "APK kurulum hatası"
→ Android 8+ (minSdk=26)
→ Unknown sources izni gerekli

---

## 📚 Dosyalar

- `app/` — FastAPI sunucu
- `android/` — Kotlin APK
- `asgi.py` — Cloudflare entry point
- `wrangler.toml` — Cloudflare config
- `requirements.txt` — Python bağımlılıkları
- `tel-pos.spec` — PyInstaller config (exe için)

---

## 🎯 Sonraki Adımlar

- [ ] Local test (curl ile gelen arama)
- [ ] APK test (Android emülatör)
- [ ] Cloudflare deploy
- [ ] Custom domain (optional)
- [ ] Yazıcı entegrasyonu (Windows)
- [ ] PyInstaller ile exe oluş (optional)

---

**Sorular?** → DEPLOY_CLOUDFLARE.md ve android/README.md
