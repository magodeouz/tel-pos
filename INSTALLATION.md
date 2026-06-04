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

Tel-POS Android cihazla çalışması için server cloud'da olmalı. **WiFi dışında çalışması için zorunlu.**

### Railway Deploy (En Basit)

1. GitHub'a push et: `git push origin main`
2. [Railway.app](https://railway.app) → Sign up (free tier var)
3. Dashboard → "Create Project" → "Deploy from GitHub"
4. Repo seç (`tel-pos`)
5. Railway otomatik detect ediyor:
   - `Dockerfile` → build
   - `requirements.txt` → dependencies
   - PORT otomatik atanıyor
6. **ÖNEMLİ: Persistent Data**
   - Settings → Volumes → Add
   - Mount Path: `/data`
   - Save
7. **Environment Variables**
   - Settings → Variables
   - `DB_DIR` = `/data` ekle
8. Deploy tamamlanınca URL görünür: `https://tel-pos-xxxx.up.railway.app`

### APK Ayarları (WiFi Dışında Çalışması İçin)

Android APK Settings:
- **Server IP**: `tel-pos-xxxx.up.railway.app` (Railway'den alınan URL)
- **Port**: `443` (HTTPS)

**Sonuç:** Telefon her yerde çalar → Android APK → REST API → Cloud → POS açılır

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
