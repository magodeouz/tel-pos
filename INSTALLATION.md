# Tel-POS Kurulum Rehberi

## Windows Müşteri (En Basit)

### Kurulum

1. `TelPOS-Setup.exe` indir
2. Çift tıkla
3. "İleri" → "Kur" → "Bitti"
4. Masaüstünde "Tel-POS" ikonu çıkar
5. Çift tıkla → Tarayıcı otomatik açılır

### Kuruluş Bilgileri

POS ekranında:
- **Admin Paneli**: http://localhost:8000/admin (ürün/kategori yönetimi)
- **Veritabanı**: `C:\Users\{KullanıcıAdı}\AppData\Local\TelPOS\tel_pos.db`

### Yazıcı Kurulumu (Termal USB)

1. Yazıcıyı USB'ye tak
2. [Zadig](https://zadig.akeo.ie/) indir
3. Zadig aç → Options → List All Devices
4. Yazıcıyı seç
5. "WinUSB" seç → Install

---

## Cloud Deploy (Android APK Için)

Tel-POS Android cihazla çalışması için server cloud'da olmalı.

### Railway Deploy (Önerilen)

1. [Railway.app](https://railway.app) → Sign up
2. Yeni project → GitHub repo bağla
3. Railway otomatik Dockerfile okur ve deploy eder
4. URL oluşur: `https://tel-pos-xxxx.up.railway.app`

### APK Ayarları

Android APK Settings:
- **Server IP**: `tel-pos-xxxx.up.railway.app`
- **Port**: `443` (HTTPS)

---

## Güncelleme

1. Yeni `TelPOS-Setup.exe` indir
2. Çalıştır (eski kurulum üzerine yazılır)
3. Veri kaybı yok (DB `AppData`'da tutulur)

---

## Sorun Giderme

### "Yazıcı Bağlı Değil"
→ Zadig ile WinUSB driver yükle

### "WebSocket Bağlantısı Açılmıyor"
→ APK Settings'te server URL doğru mu kontrol et

### "Veritabanı Hatası"
→ `C:\Users\{KullanıcıAdı}\AppData\Roaming\TelPOS\tel_pos.db` silebilir, yenisi oluşacak

---

## Geliştirici: Inno Setup ile Build

Windows'ta:

```bat
# 1. Python 3.11+ ve Inno Setup 6 yükle
# 2. Repo'yu klonla
# 3. Çalıştır:

python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 4. Build et:
build.bat

# 5. Output\TelPOS-Setup.exe oluşur
```

---

## İletişim

Sorunlar için: [github issues](https://github.com/your-repo/issues)
