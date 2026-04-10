from playwright.sync_api import sync_playwright
import time

def test_vocabulary_edit():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)  # 使用非无头模式以便观察
        page = browser.new_page()
        
        try:
            # 导航到生词本页面
            page.goto('https://sd-0721-dev.netlify.app/#vocabulary')
            page.wait_for_load_state('networkidle')
            
            # 等待页面加载
            time.sleep(2)
            
            # 检查是否需要登录
            if page.locator('text=登录').is_visible():
                print('需要登录，正在登录...')
                
                # 点击登录按钮
                page.click('text=登录')
                page.wait_for_load_state('networkidle')
                
                # 填写登录表单
                page.fill('input[type="email"]', '1318263468@qq.com')
                page.fill('input[type="password"]', '123123')
                
                # 提交登录
                page.click('button[type="submit"]')
                page.wait_for_load_state('networkidle')
                
                # 等待登录完成
                time.sleep(3)
            
            # 检查生词列表
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # 截取当前页面截图
            page.screenshot(path='/tmp/vocabulary_page.png', full_page=True)
            print('已截取生词本页面截图')
            
            # 检查是否有生词
            vocabulary_cards = page.locator('.vocabulary-card').all()
            print(f'找到 {len(vocabulary_cards)} 个生词')
            
            if len(vocabulary_cards) > 0:
                # 选择第一个生词进行编辑
                first_card = vocabulary_cards[0]
                first_card.click('button:has-text("编辑")')
                page.wait_for_load_state('networkidle')
                
                # 等待编辑表单加载
                time.sleep(2)
                
                # 截取编辑表单截图
                page.screenshot(path='/tmp/edit_form.png', full_page=True)
                print('已截取编辑表单截图')
                
                # 修改中文释义
                meaning_input = page.locator('input[placeholder="中文含义"]')
                if meaning_input.is_visible():
                    # 获取当前含义
                    current_meaning = meaning_input.input_value()
                    print(f'当前含义: {current_meaning}')
                    
                    # 输入新的含义
                    new_meaning = current_meaning + ' (测试修改)'
                    meaning_input.fill(new_meaning)
                    print(f'已修改含义为: {new_meaning}')
                    
                    # 点击保存按钮
                    page.click('button:has-text("保存")')
                    page.wait_for_load_state('networkidle')
                    
                    # 等待保存完成
                    time.sleep(3)
                    
                    # 截取保存后的页面截图
                    page.screenshot(path='/tmp/after_save.png', full_page=True)
                    print('已截取保存后的页面截图')
                    
                    # 检查是否保存成功
                    if page.locator('text=生词更新成功').is_visible():
                        print('✅ 保存成功！')
                    else:
                        print('❌ 保存失败，未看到成功提示')
                else:
                    print('❌ 未找到含义输入框')
            else:
                print('❌ 没有找到生词，无法测试编辑功能')
                
        except Exception as e:
            print(f'测试过程中出现错误: {e}')
            # 截取错误页面截图
            page.screenshot(path='/tmp/error.png', full_page=True)
        finally:
            # 关闭浏览器
            browser.close()

if __name__ == '__main__':
    test_vocabulary_edit()