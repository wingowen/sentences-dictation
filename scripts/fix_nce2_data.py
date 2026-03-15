#!/usr/bin/env python3
"""检查并修复新概念二 JSON 数据（空标题、无翻译等）"""
import json
import os
import re
import sys
import time
import urllib.request

_HOST_IP = os.popen("ip route show | grep default | awk '{print $3}'").read().strip()
if _HOST_IP:
    os.environ['http_proxy'] = f'http://{_HOST_IP}:10808'
    os.environ['https_proxy'] = f'http://{_HOST_IP}:10808'

BASE_URL = "https://newconceptenglish.com/index.php?id="
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "new-concept-2.json")


def fetch_page(lesson_id):
    url = f"{BASE_URL}{lesson_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Chrome/120"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_title(html):
    """提取文章标题"""
    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
    for p in paragraphs:
        text = re.sub(r'<[^>]+>', '', p).strip()
        if len(text) < 40 and len(text) > 5 and re.search(r'[a-zA-Z]{3,}', text):
            has_cn = bool(re.search(r'[\u4e00-\u9fa5]', text))
            if not has_cn:
                return text
    return ""


def check_data():
    """检查数据完整性"""
    with open(JSON_PATH) as f:
        data = json.load(f)

    articles = data.get("articles", [])
    issues = {"empty_title": [], "no_sentences": [], "no_translation": [], "mismatch": []}

    for a in articles:
        lid = a.get("lesson_id", "?")
        title = a.get("title", "")
        sents = a.get("sentences", [])
        cn = sum(1 for s in sents if s.get("translation", ""))

        if not title or not title.strip():
            issues["empty_title"].append(lid)
        if len(sents) == 0:
            issues["no_sentences"].append(lid)
        if cn == 0 and len(sents) > 0:
            issues["no_translation"].append(lid)
        if cn > 0 and cn < len(sents):
            issues["mismatch"].append((lid, len(sents), cn))

    return articles, issues


def fix_titles(articles, empty_lids):
    """重新抓取空标题"""
    fixed = 0
    for lid in empty_lids:
        print(f"  📖 {lid}...", end=" ", flush=True)
        try:
            html = fetch_page(lid)
            title = extract_title(html)
            if title:
                for a in articles:
                    if a["lesson_id"] == lid:
                        a["title"] = title
                        break
                print(f"✅ '{title}'")
                fixed += 1
            else:
                print("❌ 未找到")
        except Exception as e:
            print(f"❌ {e}")
        time.sleep(1.2)
    return fixed


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "check"

    if action == "check":
        articles, issues = check_data()
        total = len(articles)
        print(f"📊 NCE2 数据检查 (共 {total} 课)")
        print("=" * 45)
        print(f"❌ 空标题: {len(issues['empty_title'])} 课")
        if issues["empty_title"]:
            print(f"   → {issues['empty_title']}")
        print(f"❌ 无句子: {len(issues['no_sentences'])} 课")
        print(f"⚠️ 无翻译: {len(issues['no_translation'])} 课")
        if issues["no_translation"]:
            print(f"   → {issues['no_translation'][:10]}...")
        print(f"⚠️ 部分翻译: {len(issues['mismatch'])} 课")
        for lid, en, cn in issues["mismatch"][:5]:
            print(f"   → {lid}: {en}英/{cn}中")
        if not any(issues.values()):
            print("✅ 数据完整！")

    elif action == "fix":
        print("🔧 开始修复...")
        articles, issues = check_data()

        if issues["empty_title"]:
            print(f"\n📝 修复 {len(issues['empty_title'])} 个空标题:")
            fixed = fix_titles(articles, issues["empty_title"])
            print(f"   修复了 {fixed} 个")

        # 保存
        with open(JSON_PATH, "w") as f:
            json.dump({"success": True, "articles": articles}, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 已保存到 {JSON_PATH}")

    else:
        print("用法: python fix_nce2_data.py [check|fix]")


if __name__ == "__main__":
    main()
