@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 更新卡密验证系统到 Render
echo ========================================
echo.
echo GitHub: ghjfhfchdfcg/card-key-verification
echo Render: https://card-key-verification.onrender.com
echo.

echo 📦 步骤 1/2: 推送代码到 GitHub
echo ========================================

git add .
git commit -m "升级到新版卡密验证系统 - 端口3000 - 支持管理接口"
git push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 代码推送成功！
    echo ========================================
    echo.
    echo 📊 步骤 2/2: 等待 Render 自动部署
    echo ========================================
    echo.
    echo Render 会自动检测到代码更新并重新部署
    echo 预计需要 3-5 分钟
    echo.
    echo 🔗 查看部署进度：
    echo    https://dashboard.render.com/web/srv-d97ntnvavr4c73d9fqo0/deploys
    echo.
    echo 🌐 部署完成后访问：
    echo    https://card-key-verification.onrender.com
    echo.
    echo ✅ 新版本功能：
    echo    - 支持管理接口 /api/cardkeys/all
    echo    - 支持批量添加卡密
    echo    - 支持删除卡密
    echo    - 优化数据库性能
    echo    - 支持局域网访问（0.0.0.0）
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub 认证失败
    echo 3. 仓库权限问题
    echo.
    echo 🔧 解决方案：
    echo.
    echo 方案A: 使用 GitHub Desktop（推荐）
    echo 1. 打开 GitHub Desktop
    echo 2. 选择这个文件夹：验证服务器升级版
    echo 3. 点击 Commit to main
    echo 4. 点击 Push origin
    echo.
    echo 方案B: 使用 Personal Access Token
    echo 1. 访问 https://github.com/settings/tokens
    echo 2. Generate new token (classic)
    echo 3. 勾选 repo 权限
    echo 4. 复制 token（格式：ghp_xxxxxxxxxxxx）
    echo 5. 重新运行此脚本，使用 token 作为密码
    echo.
    echo 方案C: 手动在 Render 控制台触发部署
    echo 1. 访问 https://dashboard.render.com
    echo 2. 点击 card-key-verification
    echo 3. 点击 Manual Deploy → Deploy latest commit
    echo.
)

pause
