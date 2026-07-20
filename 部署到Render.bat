@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Kiro 卡密验证系统 - Render 部署脚本
echo ========================================
echo.

echo 📝 请输入你的 GitHub 用户名（例如：zhangsan）
set /p GITHUB_USERNAME="GitHub 用户名: "

if "%GITHUB_USERNAME%"=="" (
    echo ❌ GitHub 用户名不能为空！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 📦 步骤 1/4: 准备 Git 仓库
echo ========================================

REM 检查是否已经初始化
if not exist .git (
    git init
    echo ✅ Git 仓库已初始化
) else (
    echo ✅ Git 仓库已存在
)

echo.
echo ========================================
echo 📤 步骤 2/4: 创建 GitHub 仓库
echo ========================================

REM 使用 gh CLI 创建仓库
gh repo create kiro-cardkey-verification --public --source=. --remote=origin --push

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ 自动创建失败，请手动操作：
    echo.
    echo 1. 访问 https://github.com/new
    echo 2. 仓库名称：kiro-cardkey-verification
    echo 3. 设置为 Public（公开）
    echo 4. 不要勾选任何初始化选项
    echo 5. 点击 Create repository
    echo.
    echo 然后运行以下命令：
    echo.
    echo git remote add origin https://github.com/%GITHUB_USERNAME%/kiro-cardkey-verification.git
    echo git branch -M main
    echo git push -u origin main
    echo.
    pause
    exit /b 1
)

echo ✅ GitHub 仓库创建成功！

echo.
echo ========================================
echo 🌐 步骤 3/4: 部署到 Render
echo ========================================
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 访问 https://dashboard.render.com
echo 2. 点击 "New +" → "Web Service"
echo 3. 连接你的 GitHub 账号
echo 4. 选择仓库：kiro-cardkey-verification
echo 5. 填写配置：
echo    - Name: kiro-verify（或任意名称）
echo    - Region: Singapore（新加坡，速度快）
echo    - Branch: main
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Instance Type: Free
echo 6. 点击 "Create Web Service"
echo 7. 等待 3-5 分钟部署完成
echo.
echo ========================================
echo ✅ 部署完成后你会获得一个公网地址：
echo    https://kiro-verify.onrender.com
echo ========================================
echo.
echo 📋 这个地址可以：
echo    ✅ 发给任何人使用
echo    ✅ 24小时在线
echo    ✅ 自动HTTPS加密
echo    ✅ 永久免费
echo.
pause
