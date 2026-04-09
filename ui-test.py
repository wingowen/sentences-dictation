#!/usr/bin/env python3
"""
自动化 UI 测试脚本 - 模拟用户点击行为，每次跳转截图分析
"""
import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = '/tmp/ui-test-screenshots'

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def take_screenshot(page, name, description):
    filepath = os.path.join(SCREENSHOT_DIR, f'{name}.png')
    page.screenshot(path=filepath, full_page=True)
    print(f'\n[截图] {description}')
    print(f'  保存路径: {filepath}')
    return filepath

def analyze_page_elements(page):
    print('\n[页面元素分析]')
    
    buttons = page.locator('button').all()
    print(f'  - 按钮数量: {len(buttons)}')
    
    links = page.locator('a').all()
    print(f'  - 链接数量: {len(links)}')
    
    inputs = page.locator('input, textarea, select').all()
    print(f'  - 输入框数量: {len(inputs)}')
    
    headings = page.locator('h1, h2, h3, h4, h5, h6').all()
    print(f'  - 标题数量: {len(headings)}')
    
    modals = page.locator('[role="dialog"], .modal, [class*="modal"]').all()
    print(f'  - 模态框数量: {len(modals)}')
    
    nav_items = page.locator('nav, [role="navigation"]').all()
    print(f'  - 导航栏数量: {len(nav_items)}')
    
    return {
        'buttons': len(buttons),
        'links': len(links),
        'inputs': len(inputs),
        'headings': len(headings),
        'modals': len(modals),
        'nav_items': len(nav_items)
    }

def main():
    ensure_dir(SCREENSHOT_DIR)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 900},
            locale='zh-CN'
        )
        page = context.new_page()
        
        console_logs = []
        errors = []
        
        def handle_console(msg):
            console_logs.append(f'[Console] {msg.type}: {msg.text}')
        
        def handle_error(error):
            errors.append(f'[Error] {error}')
        
        page.on('console', handle_console)
        page.on('pageerror', handle_error)
        
        print('=' * 60)
        print('开始自动化 UI 测试')
        print('=' * 60)
        
        try:
            print('\n[步骤 1] 访问首页')
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            
            take_screenshot(page, '01-homepage', '首页加载完成')
            analyze_page_elements(page)
            
            print('\n[步骤 2] 检查数据源选择树')
            tree_items = page.locator('[class*="tree"], [class*="item"], [class*="node"]').all()
            print(f'  找到 {len(tree_items)} 个树节点')
            
            clickable_items = page.locator('button, [role="button"], [class*="clickable"], [class*="card"]').all()
            print(f'  找到 {len(clickable_items)} 个可点击元素')
            
            print('\n[步骤 3] 测试导航栏')
            navbar = page.locator('nav, [class*="navbar"], [class*="header"]').first
            if navbar.is_visible():
                take_screenshot(page, '02-navbar', '导航栏可见')
                
                dropdown_triggers = page.locator('[class*="dropdown"], [aria-haspopup]').all()
                print(f'  找到 {len(dropdown_triggers)} 个下拉菜单触发器')
                
                if len(dropdown_triggers) > 0:
                    print('\n[步骤 4] 测试下拉菜单')
                    try:
                        dropdown_triggers[0].click()
                        time.sleep(0.5)
                        take_screenshot(page, '03-dropdown-open', '下拉菜单打开')
                    except Exception as e:
                        print(f'  点击下拉菜单失败: {e}')
            
            print('\n[步骤 5] 测试设置按钮')
            settings_btn = page.locator('button:has-text("设置"), [aria-label*="设置"], [class*="settings"]').first
            if settings_btn.is_visible():
                settings_btn.click()
                time.sleep(0.5)
                take_screenshot(page, '04-settings-modal', '设置模态框')
                analyze_page_elements(page)
                
                close_btn = page.locator('button:has-text("关闭"), [aria-label*="关闭"], [class*="close"]').first
                if close_btn.is_visible():
                    close_btn.click()
                    time.sleep(0.3)
                    print('  已关闭设置模态框')
            
            print('\n[步骤 6] 测试数据源选择')
            data_source_cards = page.locator('[class*="card"], [class*="item"]').all()
            if len(data_source_cards) > 0:
                print(f'  找到 {len(data_source_cards)} 个数据源卡片')
                
                first_card = data_source_cards[0]
                card_text = first_card.inner_text() if first_card.is_visible() else 'N/A'
                print(f'  第一个卡片内容: {card_text[:50]}...')
                
                try:
                    first_card.click()
                    page.wait_for_load_state('networkidle')
                    time.sleep(1)
                    take_screenshot(page, '05-data-source-selected', '选择数据源后')
                    analyze_page_elements(page)
                except Exception as e:
                    print(f'  点击数据源卡片失败: {e}')
            
            print('\n[步骤 7] 测试返回按钮')
            back_btn = page.locator('button:has-text("返回"), [aria-label*="返回"], [class*="back"]').first
            if back_btn.is_visible():
                back_btn.click()
                page.wait_for_load_state('networkidle')
                time.sleep(0.5)
                take_screenshot(page, '06-back-to-home', '返回首页')
            
            print('\n[步骤 8] 测试闪卡功能入口')
            flashcard_btns = page.locator('button:has-text("闪卡"), a:has-text("闪卡"), [class*="flashcard"]').all()
            print(f'  找到 {len(flashcard_btns)} 个闪卡相关元素')
            
            if len(flashcard_btns) > 0:
                try:
                    flashcard_btns[0].click()
                    page.wait_for_load_state('networkidle')
                    time.sleep(1)
                    take_screenshot(page, '07-flashcard-page', '闪卡页面')
                    analyze_page_elements(page)
                except Exception as e:
                    print(f'  进入闪卡页面失败: {e}')
            
            print('\n[步骤 9] 测试生词本入口')
            vocab_btns = page.locator('button:has-text("生词"), a:has-text("生词"), [class*="vocabulary"]').all()
            print(f'  找到 {len(vocab_btns)} 个生词相关元素')
            
            page.goto('http://localhost:5173#vocabulary')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            take_screenshot(page, '08-vocabulary-page', '生词本页面')
            analyze_page_elements(page)
            
            print('\n[步骤 10] 测试练习模式')
            page.goto('http://localhost:5173#practice')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            take_screenshot(page, '09-practice-page', '练习模式页面')
            analyze_page_elements(page)
            
            print('\n[步骤 11] 测试闪卡学习')
            page.goto('http://localhost:5173#flashcard-learn')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            take_screenshot(page, '10-flashcard-learn', '闪卡学习页面')
            analyze_page_elements(page)
            
            print('\n[步骤 12] 测试生词复习')
            page.goto('http://localhost:5173#vocab-review')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            take_screenshot(page, '11-vocab-review', '生词复习页面')
            analyze_page_elements(page)
            
            print('\n[步骤 13] 最终返回首页')
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(0.5)
            take_screenshot(page, '12-final-homepage', '最终首页状态')
            
        except Exception as e:
            print(f'\n[错误] 测试过程中发生异常: {e}')
            take_screenshot(page, 'error-state', '错误状态')
        
        print('\n' + '=' * 60)
        print('测试完成')
        print('=' * 60)
        
        if errors:
            print(f'\n[页面错误] 共 {len(errors)} 个:')
            for err in errors[:5]:
                print(f'  - {err}')
        
        if console_logs:
            error_logs = [log for log in console_logs if 'error' in log.lower()]
            if error_logs:
                print(f'\n[控制台错误] 共 {len(error_logs)} 个:')
                for log in error_logs[:5]:
                    print(f'  - {log}')
        
        print(f'\n所有截图已保存到: {SCREENSHOT_DIR}')
        
        browser.close()

if __name__ == '__main__':
    main()
