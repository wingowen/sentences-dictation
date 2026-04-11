from playwright.sync_api import sync_playwright
import time

# 测试账号信息
TEST_EMAIL = "1318263468@qq.com"
TEST_PASSWORD = "123123"

# 测试环境 URL
TEST_URL = "https://sd-0721-dev.netlify.app/#vocabulary"

def test_vocabulary_sync():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)  # 使用非无头模式以便查看测试过程
        page = browser.new_page()
        
        try:
            print(f"导航到: {TEST_URL}")
            page.goto(TEST_URL)
            
            # 等待页面加载完成
            page.wait_for_load_state('networkidle')
            
            # 截图：初始状态
            page.screenshot(path='/tmp/initial_state.png', full_page=True)
            print("已保存初始状态截图")
            
            # 检查是否需要登录
            print("检查登录状态...")
            
            # 查找登录按钮或表单
            try:
                # 尝试查找登录按钮
                login_button = page.locator('text=登录')
                if login_button.is_visible():
                    print("找到登录按钮，点击登录")
                    login_button.click()
                    
                    # 等待登录模态框出现
                    page.wait_for_selector('input[type="email"]', timeout=10000)
                    
                    # 输入邮箱和密码
                    print("输入登录凭证...")
                    page.fill('input[type="email"]', TEST_EMAIL)
                    page.fill('input[type="password"]', TEST_PASSWORD)
                    
                    # 点击登录
                    page.click('text=登录')
                    print("点击登录按钮")
                    
                    # 等待登录完成
                    page.wait_for_load_state('networkidle')
                    
                    # 截图：登录后状态
                    page.screenshot(path='/tmp/after_login.png', full_page=True)
                    print("已保存登录后状态截图")
            except Exception as e:
                print(f"登录检查过程中出错: {e}")
            
            # 测试生词本功能
            print("测试生词本功能...")
            
            # 检查同步按钮是否存在
            try:
                sync_button = page.locator('text=同步')
                if sync_button.is_visible():
                    print("找到同步按钮")
                    
                    # 截图：同步按钮状态
                    page.screenshot(path='/tmp/sync_button.png', full_page=True)
                    print("已保存同步按钮状态截图")
                    
                    # 检查同步状态显示
                    sync_status = page.locator('.sync-status-text')
                    if sync_status.is_visible():
                        status_text = sync_status.text_content()
                        print(f"同步状态: {status_text}")
                    
                    # 点击同步按钮
                    print("点击同步按钮...")
                    sync_button.click()
                    
                    # 等待同步完成
                    time.sleep(3)
                    
                    # 检查同步状态是否更新
                    if sync_status.is_visible():
                        new_status_text = sync_status.text_content()
                        print(f"同步后状态: {new_status_text}")
                        
                    # 截图：同步后状态
                    page.screenshot(path='/tmp/after_sync.png', full_page=True)
                    print("已保存同步后状态截图")
                else:
                    print("未找到同步按钮")
            except Exception as e:
                print(f"同步功能测试过程中出错: {e}")
            
            # 检查生词表单是否有新增字段
            try:
                # 点击添加生词按钮
                add_button = page.locator('text=添加生词')
                if add_button.is_visible():
                    print("找到添加生词按钮，点击打开表单")
                    add_button.click()
                    
                    # 等待表单加载
                    time.sleep(1)
                    
                    # 检查是否有例句上下文字段
                    sentence_context = page.locator('label:has-text("例句上下文")')
                    if sentence_context.is_visible():
                        print("找到例句上下文字段")
                    else:
                        print("未找到例句上下文字段")
                    
                    # 截图：添加生词表单
                    page.screenshot(path='/tmp/add_form.png', full_page=True)
                    print("已保存添加生词表单截图")
            except Exception as e:
                print(f"表单测试过程中出错: {e}")
            
            # 检查控制台日志
            print("\n控制台日志:")
            for entry in page.context.cookies():
                print(f"Cookie: {entry['name']} = {entry['value']}")
                
            print("\n测试完成！")
            
        except Exception as e:
            print(f"测试过程中出错: {e}")
            # 截图：错误状态
            page.screenshot(path='/tmp/error_state.png', full_page=True)
            print("已保存错误状态截图")
        finally:
            # 关闭浏览器
            browser.close()

if __name__ == "__main__":
    test_vocabulary_sync()
