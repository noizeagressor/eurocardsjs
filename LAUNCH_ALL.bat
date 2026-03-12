@echo off
title EuroCards Full System Starter

:: Настройки прокси (порт v2rayN по умолчанию)
set PROXY_ADDR=http://127.0.0.1:10808

echo [+] Setting up environment...

:: 1. Запускаем VS Code с прокси (чтобы Roo Code сразу видел Gemini)
echo [+] Launching VS Code with Proxy...
set HTTP_PROXY=%PROXY_ADDR%
set HTTPS_PROXY=%PROXY_ADDR%
start code .

:: 2. Запускаем Бэкенд (без прокси, напрямую)
echo [+] Starting Backend...
start "BACKEND" cmd /k "cd backend && uvicorn main:app --reload"

:: 3. Запускаем Бота (С ПРОКСИ, чтобы не отвалился Telegram)
echo [+] Starting Telegram Bot (with Proxy)...
start "TG_BOT" cmd /k "cd backend && set HTTP_PROXY=%PROXY_ADDR% && set HTTPS_PROXY=%PROXY_ADDR% && python bot/main.py"

:: 4. Запускаем Фронтенд (без прокси)
echo [+] Starting Frontend...
start "FRONTEND" cmd /k "cd frontend && npm run dev"

echo ========================================
echo [ DONE ] All systems are launching!
echo [ INFO ] Check VS Code for Roo Code.
echo [ INFO ] Check your Telegram Bot.
echo ========================================
pause