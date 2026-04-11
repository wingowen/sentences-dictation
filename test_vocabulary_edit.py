from playwright.sync_api import sync_playwright
import time

def test_vocabulary_edit():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)  # 使用非无头模式以便查看测试过程
        page = browser.new_page()

        try:
            print("导航到生词本页面...")
            page.goto('http://localhost:5173/#vocabulary')

            # 等待页面加载完成
            page.wait_for_load_state('networkidle')
            time.sleep(2)  # 额外等待一下确保页面完全加载

            # 截图：初始状态
            page.screenshot(path='/tmp/vocabulary_initial.png', full_page=True)
            print("已保存初始状态截图")

            # 检查添加生词按钮
            print("查找添加生词按钮...")
            add_button = page.locator('text=添加生词')
            if add_button.is_visible():
                print("找到添加生词按钮，点击打开表单")
                add_button.click()
                time.sleep(1)  # 等待表单打开

                # 填写表单
                print("填写生词表单...")
                page.fill('input[placeholder="输入单词"]', 'testword')
                page.fill('input[placeholder="如: /əˈloʊ/"]', '/test/')
                page.fill('input[placeholder="中文含义"]', '测试单词')
                page.select_option('select', 'noun')  # 选择名词
                page.fill('textarea[placeholder="输入包含该单词的例句..."]', 'This is a test sentence with testword.')
                page.fill('textarea[placeholder="输入笔记"]', 'This is a test note.')

                # 截图：填写表单后
                page.screenshot(path='/tmp/vocabulary_form_filled.png', full_page=True)
                print("已保存填写表单后的截图")

                # 提交表单
                print("提交表单...")
                submit_button = page.locator('text=保存')
                if submit_button.is_visible():
                    submit_button.click()
                    time.sleep(2)  # 等待提交完成

                    # 截图：提交后
                    page.screenshot(path='/tmp/vocabulary_after_submit.png', full_page=True)
                    print("已保存提交后的截图")

                    # 查找编辑按钮
                    print("查找编辑按钮...")
                    # 等待生词出现在列表中
                    time.sleep(2)
                    # 查找包含testword的行
                    testword_row = page.locator('text=testword').first
                    if testword_row.is_visible():
                        print("找到testword，查找其编辑按钮")
                        # 查找编辑按钮
                        edit_button = page.locator('.edit-btn').first
                        if edit_button.is_visible():
                            print("找到编辑按钮，点击编辑")
                            edit_button.click()
                            time.sleep(1)  # 等待编辑表单打开

                            # 截图：编辑表单
                            page.screenshot(path='/tmp/vocabulary_edit_form.png', full_page=True)
                            print("已保存编辑表单截图")

                            # 修改表单数据
                            print("修改表单数据...")
                            page.fill('input[placeholder="中文含义"]', '修改后的测试单词')
                            page.fill('textarea[placeholder="输入笔记"]', '修改后的测试笔记.')

                            # 截图：修改后
                            page.screenshot(path='/tmp/vocabulary_edit_modified.png', full_page=True)
                            print("已保存修改后的截图")

                            # 提交修改
                            print("提交修改...")
                            submit_button = page.locator('text=保存')
                            if submit_button.is_visible():
                                submit_button.click()
                                time.sleep(2)  # 等待提交完成

                                # 截图：修改后结果
                                page.screenshot(path='/tmp/vocabulary_after_edit.png', full_page=True)
                                print("已保存修改后结果的截图")

                                # 验证修改是否成功
                                print("验证修改是否成功...")
                                modified_text = page.locator('text=修改后的测试单词')
                                if modified_text.is_visible():
                                    print("✅ 修改成功！")
                                else:
                                    print("❌ 修改失败！")
                        else:
                            print("未找到编辑按钮")
                    else:
                        print("未找到testword")
                else:
                    print("未找到保存按钮")
            else:
                print("未找到添加生词按钮")

            print("\n测试完成！")

        except Exception as e:
            print(f"测试过程中出错: {e}")
            # 截图：错误状态
            page.screenshot(path='/tmp/vocabulary_error.png', full_page=True)
            print("已保存错误状态截图")
        finally:
            # 关闭浏览器
            browser.close()

if __name__ == "__main__":
    test_vocabulary_edit()
