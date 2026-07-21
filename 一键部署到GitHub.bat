@echo off
chcp 65001 >nul
title Kiro卡密系统 - 一键部署到GitHub

echo ====================================
echo   Kiro卡密验证+管理系统 v2.0
echo   一键部署到GitHub
echo ====================================
echo.

REM 检查Git是否安装
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Git,请先安装Git
    echo.
    echo 下载地址: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [步骤1] 初始化Git仓库...
if not exist ".git" (
    git init
    git branch -M main
    echo ✅ Git仓库初始化完成
) else (
    echo ℹ️ Git仓库已存在
)

echo.
echo [步骤2] 请输入GitHub仓库地址
echo 格式: https://github.com/用户名/仓库名.git
echo.
set /p REPO_URL="仓库地址: "

if "%REPO_URL%"=="" (
    echo [错误] 仓库地址不能为空
    pause
    exit /b 1
)

echo.
echo [步骤3] 添加远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
if %errorlevel% equ 0 (
    echo ✅ 远程仓库配置完成
) else (
    echo [错误] 添加远程仓库失败
    pause
    exit /b 1
)

echo.
echo [步骤4] 添加文件到Git...
git add .
if %errorlevel% equ 0 (
    echo ✅ 文件添加完成
) else (
    echo [警告] 部分文件添加失败
)

echo.
echo [步骤5] 创建提交...
git commit -m "Kiro卡密验证+管理系统 v2.0 - 初始版本"
if %errorlevel% equ 0 (
    echo ✅ 提交创建完成
) else (
    echo ℹ️ 没有新的更改需要提交
)

echo.
echo [步骤6] 推送到GitHub...
echo 正在推送,请稍候...
git push -u origin main --force
if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo   ✅ 部署成功!
    echo ====================================
    echo.
    echo 下一步:
    echo 1. 访问 https://render.com
    echo 2. 点击 "New +" - "Web Service"
    echo 3. 连接刚才的GitHub仓库
    echo 4. 配置:
    echo    - Build Command: npm install
    echo    - Start Command: npm start
    echo 5. 点击 "Create Web Service"
    echo.
    echo 等待部署完成后,您将获得公网访问地址
    echo.
) else (
    echo.
    echo [失败] 推送失败
    echo.
    echo 可能的原因:
    echo 1. 仓库地址不正确
    echo 2. 没有推送权限
    echo 3. 需要先在GitHub创建仓库
    echo.
    echo 请检查后重试
)

echo.
pause
