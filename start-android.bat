@echo off
set "ANDROID_HOME=C:\Users\HP VICTUS\AppData\Local\Android\Sdk"
set "PATH=C:\Users\HP VICTUS\AppData\Local\Android\Sdk\platform-tools;%PATH%"
echo [Mom Oi] Starting Expo server and Android emulator connection...
npx.cmd expo start --android --clear
