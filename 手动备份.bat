@echo off
chcp 65001 >nul
title 手动备份卡密数据

echo ╔══════════════════════════════════════════════╗
echo ║   📦 手动备份卡密数据                         ║
echo ╔══════════════════════════════════════════════╗
echo.

node backup-cardkeys.js

echo.
pause
