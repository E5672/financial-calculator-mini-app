@echo off
echo ====================================
echo   TMS Container - Запуск системы
echo ====================================
echo.

REM Проверка .env
if not exist "backend\.env" (
    echo [!] Файл backend\.env не найден.
    echo     Копирую из .env.example...
    copy backend\.env.example backend\.env
    echo.
    echo [!] ВНИМАНИЕ: Откройте backend\.env и вставьте ваш API-ключ Яндекс.Карт
    echo     Получить ключ: https://developer.tech.yandex.ru/
    echo.
    pause
)

echo [1/2] Запускаю Backend (порт 3001)...
start "TMS Backend" cmd /k "cd backend && npm install --silent && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Запускаю Frontend (порт 3000)...
start "TMS Frontend" cmd /k "cd frontend && npm install --silent && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ====================================
echo   Система запущена!
echo   Откройте: http://localhost:3000
echo ====================================
echo.
start http://localhost:3000
pause
