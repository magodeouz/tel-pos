; Inno Setup script for Tel-POS
; Windows installer oluşturur: TelPOS-Setup.exe

[Setup]
AppName=Tel-POS
AppVersion=1.0.0
AppPublisher=Tel-POS
AppPublisherURL=https://tel-pos.example.com
AppSupportURL=https://tel-pos.example.com
AppUpdatesURL=https://tel-pos.example.com
DefaultDirName={autopf}\TelPOS
DefaultGroupName=Tel-POS
OutputDir=Output
OutputBaseFilename=TelPOS-Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=app/static/logo.svg
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "turkish"; MessagesFile: "compiler:Turkish.isl"

[Files]
Source: "dist\tel-pos.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Tel-POS"; Filename: "{app}\tel-pos.exe"; IconFileName: "{app}\tel-pos.exe"; IconIndex: 0
Name: "{commondesktop}\Tel-POS"; Filename: "{app}\tel-pos.exe"; IconFileName: "{app}\tel-pos.exe"; IconIndex: 0

[Run]
Filename: "{app}\tel-pos.exe"; Description: "Tel-POS'u Başlat"; Flags: postinstall nowait

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('Tel-POS kuruldu!' + #13#10 + 'Masaüstü ikonundan başlatabilirsiniz.', mbInformation, MB_OK);
  end;
end;
