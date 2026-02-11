#!/bin/bash
# 完整的自动化测试脚本 - Sentences-Dictation Admin
# 使用 agent-browser 工具

set -e

echo "🚀 开始自动化测试..."
echo ""

# 项目目录
PROJECT_DIR="/home/wingo/code/sentences-dictation/admin"
cd $PROJECT_DIR

# 测试配置
BASE_URL="http://localhost:3000"
TEST_EMAIL="admin@example.com"
TEST_PASSWORD="admin123"
TEST_ARTICLE_TITLE="自动化测试文章 - $(date +%Y%m%d_%H%M%S)"
SCREENSHOT_DIR="$PROJECT_DIR/test-screenshots"

# 创建截图目录
mkdir -p $SCREENSHOT_DIR

echo "📋 测试计划:"
echo "  1. 打开登录页面"
echo "  2. 输入登录凭据"
echo "  3. 登录系统"
echo "  4. 导航到文章管理"
echo "  5. 创建新文章"
echo "  6. 添加句子"
echo "  7. 保存文章"
echo "  8. 验证创建结果"
echo ""

# ============================================
# 测试 1: 打开登录页面
# ============================================
echo "🔍 [1/8] 打开登录页面..."
npx agent-browser open $BASE_URL
sleep 2

# 截图
npx agent-browser screenshot $SCREENSHOT_DIR/01-login-page.png
echo "  ✅ 登录页面已打开"

# ============================================
# 测试 2: 输入登录凭据
# ============================================
echo ""
echo "📝 [2/8] 输入登录凭据..."

# 获取页面元素
npx agent-browser snapshot -i

# 输入邮箱（假设 ref 是 @e1）
npx agent-browser type @e1 "$TEST_EMAIL"
echo "  ✅ 邮箱已输入: $TEST_EMAIL"

# 输入密码（假设 ref 是 @e2）
npx agent-browser type @e2 "$TEST_PASSWORD"
echo "  ✅ 密码已输入"

npx agent-browser screenshot $SCREENSHOT_DIR/02-credentials-entered.png

# ============================================
# 测试 3: 点击登录按钮
# ============================================
echo ""
echo "🔐 [3/8] 点击登录按钮..."

# 点击登录（假设 ref 是 @e3）
npx agent-browser click @e3
echo "  ✅ 登录按钮已点击"

# 等待跳转
sleep 3

# 检查是否跳转成功
npx agent-browser snapshot -i > /tmp/after-login.txt
if grep -q "Dashboard\|仪表板\|文章管理" /tmp/after-login.txt; then
    echo "  ✅ 登录成功，已跳转到管理后台"
    npx agent-browser screenshot $SCREENSHOT_DIR/03-dashboard.png
else
    echo "  ❌ 登录失败，仍在登录页面"
    npx agent-browser screenshot $SCREENSHOT_DIR/03-login-failed.png
    echo "  📸 错误截图已保存"
    exit 1
fi

# ============================================
# 测试 4: 导航到文章管理
# ============================================
echo ""
echo "📂 [4/8] 导航到文章管理..."

# 获取导航菜单元素
npx agent-browser snapshot

# 查找文章管理链接（需要根据实际 ref 调整）
# 假设文章管理的 ref 是 @e10（需要实际测试确定）
ARTICLE_MENU_REF=$(npx agent-browser snapshot | grep "文章管理" | grep -oP '\[ref=\K@[a-z0-9]+' | head -1)

if [ -n "$ARTICLE_MENU_REF" ]; then
    npx agent-browser click $ARTICLE_MENU_REF
    echo "  ✅ 已点击文章管理菜单"
    sleep 2
    npx agent-browser screenshot $SCREENSHOT_DIR/04-articles-list.png
else
    echo "  ❌ 未找到文章管理菜单"
    exit 1
fi

# ============================================
# 测试 5: 点击新建文章按钮
# ============================================
echo ""
echo "➕ [5/8] 创建新文章..."

# 查找新建文章按钮
NEW_ARTICLE_REF=$(npx agent-browser snapshot | grep "新建文章\|新建" | grep -oP '\[ref=\K@[a-z0-9]+' | head -1)

if [ -n "$NEW_ARTICLE_REF" ]; then
    npx agent-browser click $NEW_ARTICLE_REF
    echo "  ✅ 已点击新建文章按钮"
    sleep 2
    npx agent-browser screenshot $SCREENSHOT_DIR/05-article-editor.png
else
    echo "  ❌ 未找到新建文章按钮"
    exit 1
fi

# ============================================
# 测试 6: 填写文章表单
# ============================================
echo ""
echo "📝 [6/8] 填写文章信息..."

# 获取表单元素
npx agent-browser snapshot -i

# 输入标题（假设标题输入框是 @e1）
npx agent-browser type @e1 "$TEST_ARTICLE_TITLE"
echo "  ✅ 标题已输入: $TEST_ARTICLE_TITLE"

# 输入描述（假设描述框是 @e2）
npx agent-browser type @e2 "这是通过 agent-browser 自动化测试创建的文章。创建时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  ✅ 描述已输入"

npx agent-browser screenshot $SCREENSHOT_DIR/06-form-filled.png

# ============================================
# 测试 7: 添加句子
# ============================================
echo ""
echo "✍️  [7/8] 添加句子..."

# 查找添加句子按钮
ADD_SENTENCE_REF=$(npx agent-browser snapshot | grep "添加句子" | grep -oP '\[ref=\K@[a-z0-9]+' | head -1)

if [ -n "$ADD_SENTENCE_REF" ]; then
    # 添加第一个句子
    npx agent-browser click $ADD_SENTENCE_REF
    sleep 1
    echo "  ✅ 已添加句子输入框"
    
    # 输入句子内容（假设新添加的输入框 ref）
    npx agent-browser type @e10 "This is the first test sentence from automation."
    echo "  ✅ 第一个句子已输入"
    
    # 再添加一个句子
    npx agent-browser click $ADD_SENTENCE_REF
    sleep 1
    npx agent-browser type @e11 "Learning English is important for everyone."
    echo "  ✅ 第二个句子已输入"
    
    npx agent-browser screenshot $SCREENSHOT_DIR/07-sentences-added.png
else
    echo "  ❌ 未找到添加句子按钮"
fi

# ============================================
# 测试 8: 保存文章
# ============================================
echo ""
echo "💾 [8/8] 保存文章..."

# 查找保存按钮
SAVE_REF=$(npx agent-browser snapshot | grep "保存" | grep -oP '\[ref=\K@[a-z0-9]+' | head -1)

if [ -n "$SAVE_REF" ]; then
    npx agent-browser click $SAVE_REF
    echo "  ✅ 保存按钮已点击"
    
    # 等待保存完成
    sleep 3
    
    npx agent-browser screenshot $SCREENSHOT_DIR/08-article-saved.png
    
    # 检查是否跳转到详情页
    npx agent-browser snapshot > /tmp/after-save.txt
    if grep -q "测试文章\|成功\|Success" /tmp/after-save.txt; then
        echo "  ✅ 文章保存成功！"
    else
        echo "  ⚠️  无法确认保存状态"
    fi
else
    echo "  ❌ 未找到保存按钮"
fi

# ============================================
# 测试完成
# ============================================
echo ""
echo "✨ 自动化测试完成！"
echo ""
echo "📊 测试摘要:"
echo "  - 测试文章标题: $TEST_ARTICLE_TITLE"
echo "  - 截图保存位置: $SCREENSHOT_DIR"
echo "  - 截图数量: $(ls -1 $SCREENSHOT_DIR/*.png | wc -l)"
echo ""
echo "📸 截图文件:"
ls -1 $SCREENSHOT_DIR/*.png

# 关闭浏览器
npx agent-browser close

echo ""
echo "🎉 测试脚本执行完毕！"
