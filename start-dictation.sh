#!/bin/bash
# 文章听写服务启动脚本 (主服务 + 管理后台)
# 用法: ./start-dictation.sh [--browser]

set -e

PROJECT_DIR="/home/wingo/code/sentences-dictation"
ADMIN_DIR="/home/wingo/code/sentences-dictation/admin"
MAIN_PORT=8888
ADMIN_PORT=3000

# 解析参数
OPEN_BROWSER=false
for arg in "$@"; do
    case $arg in
        --browser|-b)
            OPEN_BROWSER=true
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --browser, -b    启动后打开浏览器"
            echo "  --help, -h       显示帮助信息"
            echo ""
            echo "默认不打开浏览器。"
            exit 0
            ;;
    esac
done

echo "🎯 启动文章听写服务..."
echo "📍 主应用: $PROJECT_DIR"
echo "📍 管理后台: $ADMIN_DIR"
echo ""
echo "🌐 主应用: http://localhost:$MAIN_PORT"
echo "🌐 管理后台: http://localhost:$ADMIN_PORT"
echo ""

# 启动主应用服务 (不打开浏览器)
cd "$PROJECT_DIR"
echo "🔇 启动主应用服务..."
BROWSER=none netlify dev --port $MAIN_PORT --no-open &
MAIN_PID=$!

# 启动管理后台 (使用本地 vite)
cd "$ADMIN_DIR"
echo "🔇 启动管理后台..."
ADMIN_PID=0

# 使用 npx 强制使用本地安装的 vite
if npx vite --port $ADMIN_PORT --host 2>&1 &
then
    ADMIN_PID=$!
else
    # 如果失败，使用环境变量方法
    echo "🔇 尝试使用 Vite 启动..."
    PORT=$ADMIN_PORT npx vite --host &
    ADMIN_PID=$!
fi

echo ""
echo "✅ 服务已启动!"
echo ""
echo "进程信息:"
echo "  - 主应用 (PID: $MAIN_PID) → http://localhost:$MAIN_PORT"
echo "  - 管理后台 (PID: $ADMIN_PID) → http://localhost:$ADMIN_PORT"
echo ""

# 如果需要打开浏览器
if [ "$OPEN_BROWSER" = true ]; then
    echo "🌍 正在打开浏览器..."
    sleep 3
    xdg-open "http://localhost:$ADMIN_PORT" 2>/dev/null || \
    open "http://localhost:$ADMIN_PORT" 2>/dev/null || \
    echo "请手动打开浏览器访问管理后台"
else
    echo "👉 如需打开浏览器，运行: $0 --browser"
    echo "👉 主应用: http://localhost:$MAIN_PORT"
    echo "👉 管理后台: http://localhost:$ADMIN_PORT"
fi

echo ""
echo "按 Ctrl+C 停止服务"

# 等待并捕获退出信号
trap "kill $MAIN_PID $ADMIN_PID 2>/dev/null; exit" SIGINT SIGTERM

# 保持脚本运行
wait
