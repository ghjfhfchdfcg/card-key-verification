@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 推送到 GitHub
echo ========================================
echo.
echo 仓库信息：
echo - 用户名: ghjfhfchdfcg
echo - 仓库名: kiro-cardkey-verification
echo - 地址: https://github.com/ghjfhfchdfcg/kiro-cardkey-verification
echo.
echo ⚠️ 如果仓库不存在，请先访问以下地址创建：
echo    https://github.com/new
echo.
echo    填写信息：
echo    - Repository name: kiro-cardkey-verification
echo    - Public（公开）
echo    - 不要勾选任何初始化选项
echo.
pause
echo.
echo 📤 正在推送代码...
echo.

git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo 下一步：部署到 Render
    echo.
    echo 1. 访问 https://dashboard.render.com
    echo 2. 点击 New + → Web Service
    echo 3. 连接 GitHub 并选择仓库：
    echo    ghjfhfchdfcg/kiro-cardkey-verification
    echo 4. 填写配置：
    echo    - Name: kiro-verify
    echo    - Region: Singapore
    echo    - Build Command: npm install
    echo    - Start Command: npm start
    echo    - Instance Type: Free
    echo 5. 点击 Create Web Service
    echo 6. 等待 3-5 分钟部署完成
    echo.
    echo 🌐 部署完成后你会获得公网地址：
    echo    https://kiro-verify.onrender.com
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 仓库不存在 - 请先在 GitHub 创建仓库
    echo 2. 网络问题 - 请检查网络连接
    echo 3. 认证失败 - 使用 Personal Access Token 作为密码
    echo.
    echo 获取 Token：
    echo 1. 访问 https://github.com/settings/tokens
    echo 2. Generate new token (classic)
    echo 3. 勾选 repo 权限
    echo 4. 复制 token（格式：ghp_xxxxxxxxxxxx）
    echo 5. 重新运行此脚本，使用 token 作为密码
    echo.
)

pause
