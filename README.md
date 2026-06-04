# Tel-POS — Restoran Telefon + Sipariş Yönetim Sistemi

Python + FastAPI + SQLite ile yazılmış, tek exe dosyası olarak çalışan bir POS sistemi.

## Özellikler

- 🎯 **Gelen Çağrı Entegrasyonu**: Android APK'dan gelen numara → tarayıcı ekranında müşteri kartı
- 💳 **Sipariş Yönetimi**: Müşteri seçimi, ürün ekleme, adisyon yazdırma
- 🖨️ **USB Termal Yazıcı**: ESC/POS standart yazıcılar
- 📱 **WebSocket**: Gerçek zamanlı bildirimler
- 💾 **SQLite**: Kolay, dosya tabanlı veritabanı

## Kurulum

### Windows

1. **Python 3.10+** yükleyin
2. **Zadig** (libusb driver) yükleyin:
   - https://zadig.akeo.ie/ adresinden indir
   - Yazıcıyı bağla
   - Zadig'de cihazı seç → WinUSB driver yükle
3. Proje dosyalarını indir
4. `pip install -r requirements.txt` çalıştır

### macOS / Linux

```bash
pip install -r requirements.txt
```

## Geliştirme

```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Sunucuyu başlat (tarayıcı otomatik açılır)
python -m uvicorn app.main:app --reload
```

Tarayıcıda `http://localhost:8000` açılacaktır.

### Admin Paneli

`http://localhost:8000/admin` adresinden ürün ve kategori yönetimi yapılır.

## Paketleme (PyInstaller)

Tek exe dosyası oluşturmak için:

```bash
pyinstaller tel-pos.spec
```

Dosya `dist/tel-pos.exe` (Windows) / `dist/tel-pos` (macOS/Linux) olarak oluşturulur.

## API Endpoints

### Müşteriler
- `GET /api/customers` — tüm müşteriler
- `GET /api/customers/search?phone=05551234567` — ara
- `POST /api/customers` — yeni ekle
- `PUT /api/customers/{id}` — güncelle
- `DELETE /api/customers/{id}` — sil

### Kategoriler & Ürünler
- `GET /api/categories` — tüm kategoriler + ürünler
- `POST /api/categories` — kategori ekle
- `POST /api/products` — ürün ekle
- `PUT /api/products/{id}` — güncelle
- `DELETE /api/products/{id}` — soft delete

### Siparişler
- `GET /api/orders?status=open` — aktif siparişler
- `POST /api/orders` — sipariş aç
- `POST /api/orders/{id}/items` — ürün ekle
- `DELETE /api/orders/{id}/items/{item_id}` — ürün çıkar
- `PATCH /api/orders/{id}/status` — durumu değiştir
- `POST /api/orders/{id}/print` — yazı

### Telefon Entegrasyonu
- `POST /api/incoming-call` — gelen arama bilgisi
- `WS /ws` — WebSocket (tarayıcı bağlantısı)

## Gelen Arama Simülasyonu (Test)

```bash
curl -X POST http://localhost:8000/api/incoming-call \
  -H "Content-Type: application/json" \
  -d '{"phone":"05551234567"}'
```

## Yazıcı Sorunu

**Yazıcı çıkmıyorsa** (Windows):

1. Zadig'i aç
2. Options → List All Devices
3. Termal yazıcını seç
4. WinUSB driver yükle
5. Yazıcı bağlantısını kes/tak

## Yapı

```
tel-pos/
├── app/
│   ├── main.py          # FastAPI app + startup
│   ├── database.py      # SQLAlchemy setup
│   ├── models.py        # ORM modelleri
│   ├── config.py        # Sabitleri
│   ├── printer.py       # ESC/POS controller
│   ├── routers/         # API endpoints
│   └── static/          # HTML/JS/CSS
├── requirements.txt
├── tel-pos.spec         # PyInstaller config
└── README.md
```

## Lisans

MIT
