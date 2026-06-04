@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ===============================================
echo   Windows Startup'a Tunnel Ekle
echo ===============================================
echo.

REM Get current directory
set SCRIPT_DIR=%~dp0
set STARTUP_SCRIPT=!SCRIPT_DIR!start-tunnel-bg.bat

REM Create hidden startup script
(
    echo @echo off
    echo setlocal enabledelayedexpansion
    echo cloudflared tunnel run tel-pos
) > "!STARTUP_SCRIPT!"

echo ✓ Startup script oluşturuldu: !STARTUP_SCRIPT!
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Uyarı: Yönetici haklarıyla çalıştırmanız gerekiyor
    echo Bu pencereyi kapatıp, "Yönetici olarak Çalıştır" seçeneğiyle tekrar çalıştırın
    pause
    exit /b 1
)

REM Add to startup folder
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
copy "!STARTUP_SCRIPT!" "!STARTUP_FOLDER!\tel-pos-tunnel.bat"

if %errorlevel% equ 0 (
    echo ✓ Tunnel Windows startup'a eklendi
    echo.
    echo Sonraki açılışta otomatik başlayacak
) else (
    echo Hata: Startup folder'a yazılamadı
)

echo.
pause
