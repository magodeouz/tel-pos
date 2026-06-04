@echo off
REM Tel-POS Windows Installer Build Script

echo ============================================
echo Tel-POS Windows Installer Builder
echo ============================================

REM Python venv'i aktif et
call venv\Scripts\activate.bat

REM PyInstaller ile exe oluştur
echo.
echo [1/2] Building executable with PyInstaller...
pyinstaller tel-pos.spec --clean --distpath dist

if errorlevel 1 (
    echo ERROR: PyInstaller build failed!
    pause
    exit /b 1
)

REM Inno Setup ile installer oluştur
echo.
echo [2/2] Creating installer with Inno Setup...

REM Inno Setup yolunu kontrol et
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" tel-pos-installer.iss
) else if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    "C:\Program Files\Inno Setup 6\ISCC.exe" tel-pos-installer.iss
) else (
    echo.
    echo WARNING: Inno Setup 6 not found!
    echo Please install Inno Setup 6 from: https://jrsoftware.org/isdl.php
    echo After installation, run this script again.
    pause
    exit /b 1
)

if errorlevel 1 (
    echo ERROR: Inno Setup build failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo SUCCESS!
echo Installer ready: Output\TelPOS-Setup.exe
echo ============================================
echo.
echo Müşteriye "Output\TelPOS-Setup.exe" gönder
pause
