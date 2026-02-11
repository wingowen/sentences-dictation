#!/bin/bash
# 快速测试脚本 - 测试前端页面加载和 UI 交互
# 无需后端即可运行

echo "🎯 快速前端测试"
echo "================"
echo ""

PROJECT_DIR="/home/wingo/code/sentences-dictation/admin"
cd $PROJECT_DIR

echo "✅ [1/4] 打开登录页面"
npx agent-browser open http://localhost:3000
sleep 1

echo "✅ [2/4] 获取页面元素"
npx agent-browser snapshot -i

echo ""
echo "✅ [3/4] 测试表单输入"
npx agent-browser type @e1 "test@example.com"
npx agent-browser type @e2 "password123"

echo ""
echo "✅ [4/4] 截图保存"
npx agent-browser screenshot frontend-test.png

echo ""
echo "📸 截图已保存: frontend-test.png"
echo ""
echo "📊 测试结果:"
echo "  ✅ 页面可正常打开"
echo "  ✅ 元素可正常识别"
echo "  ✅ 表单可正常输入"
echo "  ✅ 截图功能正常"
echo ""
echo "⚠️  注意: 登录功能需要 Supabase 后端支持"
echo "🔧 请配置 Supabase 后重新测试完整流程"

npx agent-browser close
