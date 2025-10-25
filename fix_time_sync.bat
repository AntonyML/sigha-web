@echo off
echo Configurando sincronización automática de tiempo...
echo.

REM Configurar servidores NTP
w32tm /config /manualpeerlist:"time.windows.com,0x1 time.nist.gov,0x1 pool.ntp.org,0x1" /syncfromflags:manual /reliable:yes /update

REM Reiniciar servicio de tiempo
net stop w32time
net start w32time

REM Forzar sincronización
w32tm /resync

REM Verificar configuración
echo.
echo Configuración actual:
w32tm /query /configuration

REM Verificar estado
echo.
echo Estado de sincronización:
w32tm /query /status

echo.
echo ¡Configuración completada! La hora se sincronizará automáticamente.
pause