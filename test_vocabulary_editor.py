from playwright.sync_api import sync_playwright
import time

def test_vocabulary_editor():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)  # 非无头模式，以便观察测试过程
        page = browser.new_page()
        
        try:
            # 导航到应用
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle', timeout=60000)
            
            # 截图：初始页面
            page.screenshot(path='/tmp/initial_page.png', full_page=True)
            print("初始页面截图已保存")
            
            # 点击登录按钮
            print("点击登录按钮...")
            page.click('text=登录')
            page.wait_for_load_state('networkidle')
            
            # 输入登录信息
            print("输入登录信息...")
            page.fill('input[name="email"]', '1318263468@qq.com')
            page.fill('input[name="password"]', '123123')
            
            # 点击登录按钮
            print("点击登录按钮...")
            page.click('button:has-text("立即登录")')
            page.wait_for_load_state('networkidle', timeout=60000)
            
            # 截图：登录后页面
            page.screenshot(path='/tmp/login_success.png', full_page=True)
            print("登录后页面截图已保存")
            
            # 导航到生词本页面
            print("导航到生词本页面...")
            page.goto('http://localhost:5173/#vocabulary')
            page.wait_for_load_state('networkidle', timeout=60000)
            
            # 截图：生词本页面
            page.screenshot(path='/tmp/vocabulary_page.png', full_page=True)
            print("生词本页面截图已保存")
            
            # 点击添加生词按钮
            print("点击添加生词按钮...")
            page.click('text=+ 添加生词')
            page.wait_for_load_state('networkidle')
            
            # 截图：添加生词表单
            page.screenshot(path='/tmp/add_vocab_form.png', full_page=True)
            print("添加生词表单截图已保存")
            
            # 输入生词信息
            print("输入生词信息...")
            page.fill('input[placeholder="输入单词"]', 'testword')
            page.fill('input[placeholder="如: /əˈloʊ/"]', '/test/')
            page.fill('input[placeholder="中文含义"]', '测试单词')
            
            # 选择词性
            print("选择词性...")
            page.select_option('select', 'noun')
            
            # 输入笔记
            page.fill('textarea[placeholder="添加笔记..."]', '这是一个测试单词')
            
            # 点击添加按钮
            print("点击添加按钮...")
            page.click('text=添加')
            page.wait_for_load_state('networkidle', timeout=60000)
            
            # 截图：添加生词后
            page.screenshot(path='/tmp/add_vocab_success.png', full_page=True)
            print("添加生词后截图已保存")
            
            # 查找刚添加的单词并编辑
            print("查找刚添加的单词...")
            # 等待单词出现
            page.wait_for_selector('text=testword', timeout=60000)
            
            # 点击编辑按钮
            print("点击编辑按钮...")
            # 找到包含testword的卡片，然后点击其编辑按钮
            vocab_card = page.locator('text=testword').first.closest('.vocabulary-card')
            edit_button = vocab_card.locator('text=编辑')
            edit_button.click()
            page.wait_for_load_state('networkidle')
            
            # 截图：编辑生词表单
            page.screenshot(path='/tmp/edit_vocab_form.png', full_page=True)
            print("编辑生词表单截图已保存")
            
            # 修改单词信息
            print("修改单词信息...")
            page.fill('input[placeholder="输入单词"]', 'testword2')
            page.fill('input[placeholder="中文含义"]', '测试单词2')
            
            # 点击保存按钮
            print("点击保存按钮...")
            page.click('text=保存')
            page.wait_for_load_state('networkidle', timeout=60000)
            
            # 截图：编辑生词后
            page.screenshot(path='/tmp/edit_vocab_success.png', full_page=True)
            print("编辑生词后截图已保存")
            
            # 查找刚编辑的单词并删除
            print("查找刚编辑的单词...")
            # 等待单词出现
            page.wait_for_selector('text=testword2', timeout=60000)
            
            # 点击删除按钮
            print("点击删除按钮...")
            # 找到包含testword2的卡片，然后点击其删除按钮
            vocab_card = page.locator('text=testword2').first.closest('.vocabulary-card')
            delete_button = vocab_card.locator('text=删除')
            delete_button.click()
            page.wait_for_load_state('networkidle')
            
            # 确认删除
            print("确认删除...")
            page.click('text=删除')
            page.wait_for_load_state('networkidle', timeout=60000)
            
            # 截图：删除生词后
            page.screenshot(path='/tmp/delete_vocab_success.png', full_page=True)
            print("删除生词后截图已保存")
            
            print("测试完成！")
            
        except Exception as e:
            print(f"测试过程中出现错误: {e}")
            # 截图错误页面
            page.screenshot(path='/tmp/error.png', full_page=True)
            raise
        finally:
            # 关闭浏览器
            browser.close()

if __name__ == "__main__":
    test_vocabulary_editor()
