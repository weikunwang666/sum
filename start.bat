@echo off
chcp 65001 >nul
title Project Universe Hub - 服务启动中...
echo ========================================================
echo   🚀 Project Universe Hub - 个人作品中心导航站
echo   正在连接 MySQL 数据库并启动服务...
echo   访问网址: http://localhost:3000
echo   API 地址: http://localhost:3000/api/projects
echo ========================================================
cd /d "%~dp0\server"
node server.js
pause
