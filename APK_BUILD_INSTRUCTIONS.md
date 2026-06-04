# APK Derleme Talimatları

Android SDK olmadan doğrudan derleme yapılamaz. İki seçenek:

## Seçenek 1: Android Studio (En Kolay) ✅

1. [Android Studio indir](https://developer.android.com/studio)
2. Proje aç: `File → Open → /Users/oguzakpinar/projects/tel-pos/android`
3. `Build → Build Bundle(s) / APK(s) → Build APK(s)`
4. Bitmesi bekleniyor (2-3 dakika)
5. APK: `android/app/build/outputs/apk/debug/app-debug.apk`

## Seçenek 2: CLI (Advacned)

```bash
# 1. Android SDK Command Line Tools indir
mkdir -p ~/Library/Android/sdk
cd ~/Library/Android/sdk

# 2. cmdline-tools indir (latest)
curl -O https://dl.google.com/android/repository/commandlinetools-mac-latest.zip
unzip commandlinetools-mac-latest.zip
rm commandlinetools-mac-latest.zip
mv cmdline-tools latest
mkdir -p cmdline-tools && mv latest cmdline-tools/

# 3. SDK packages yükle
export PATH="$HOME/Library/Android/sdk/cmdline-tools/latest/bin:$PATH"
yes | sdkmanager --licenses
sdkmanager "platforms;android-34" "build-tools;34.0.0" "ndk;27.0.11902837"

# 4. Build et
cd /Users/oguzakpinar/projects/tel-pos/android
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH
./gradlew assembleDebug

# 5. APK bulunur
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

## APK Dosyası

Derleme başarılı olursa:
```
/Users/oguzakpinar/projects/tel-pos/android/app/build/outputs/apk/debug/app-debug.apk
```

## Yükleme

```bash
# Emülatör / Cihaz bağlan
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Cloudflare Deploy (APK Hazır Olunca)

Sonra: [DEPLOY_CLOUDFLARE.md](../DEPLOY_CLOUDFLARE.md)
