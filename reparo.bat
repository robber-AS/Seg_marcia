@echo off
title Ferramenta de Reparo Windows

color 0A

echo ==============================
echo REPARO E OTIMIZACAO WINDOWS
echo ==============================

echo.
echo 1 - SFC SCANNOW
echo 2 - DISM REPAIR
echo 3 - CHKDSK
echo 4 - FLUSH DNS
echo 5 - RESET REDE
echo 6 - LIMPEZA DISCO
echo 7 - SAIR

set /p op=Escolha:

if %op%==1 sfc /scannow
if %op%==2 DISM /Online /Cleanup-Image /RestoreHealth
if %op%==3 chkdsk C: /f /r
if %op%==4 ipconfig /flushdns
if %op%==5 netsh winsock reset
if %op%==6 cleanmgr
if %op%==7 exit

pause