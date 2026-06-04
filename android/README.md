# Tel-POS Android APK

Restoran telefon uygulaması. Gelen aramaları yakalayıp Python POS sunucusuna iletir.

## Özellikler

- 📞 Gelen çağrıları yakalama
- 🔗 Webhook ile Python sunucusuna iletme
- ⚙️ IP/Port ayarları (SharedPreferences)
- 🧪 Bağlantı test fonksiyonu
- ✅ Sıfır harici dependency

## Kurulum

### Android Studio ile

1. `android/` dizinini Android Studio'da aç
2. Project → Sync with Gradle
3. Run → Select Device/Emulator
4. APK derlenip yüklenecek

### Emülatörde Test

1. MainActivity'de server IP'sini gir (örn: `10.0.2.2:8000` — localhost'u emülatörde temsil eder)
2. "Bağlantı Test Et" butonuna tıkla
3. Extended Controls → Phone → Call state'ini değiştir
4. Python sunucusu konsolu POST logunu gösterecektir

### Gerçek Cihazda

1. MainActivity'de restoran WiFi IP'sini gir (örn: `192.168.1.5:8000`)
2. Telefon çaldığında APK webhook atar
3. Python tarayıcısı modal gösterecektir

## Akış

```
Telefon çalar
    ↓
CallReceiver.onReceive() — state == RINGING
    ↓
getServerUrl() — SharedPreferences'ten oku
    ↓
POST /api/incoming-call {"phone": "..."}
    ↓
Python → WebSocket broadcast
    ↓
Tarayıcı modal aç
```

## İzinler

- `READ_PHONE_STATE` — çağrı durumunu okumak
- `INTERNET` — sunucuya POST atmak
- Android 10+ runtime izni gerektirir

## Mimari

- **CallReceiver**: BroadcastReceiver — PHONE_STATE intent'i yakalar
- **MainActivity**: Settings UI — IP/port girişi + test
- **PrefsHelper**: SharedPreferences wrapper — persistence
- **HttpURLConnection**: Standart Java kütüphanesi — dependency yok

## Hata Yönetimi

- Bağlantı başarısız olursa sessizce geç (try-catch)
- 5 saniye timeout — uzun beklemeyi engelle
- Toast (test butonunda) — user-facing hatalar

## Geliştirme

- Min SDK: 26 (Android 8)
- Target SDK: 34 (Android 14)
- Kotlin 1.9.20
- AndroidX compat kütüphaneleri

## Derleme

Release APK:

```bash
cd android
./gradlew assembleRelease
```

Dosya: `app/build/outputs/apk/release/app-release.apk`
