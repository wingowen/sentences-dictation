#!/bin/bash
# 检查 Netlify Functions 是否配置了数据库访问
echo "Checking Netlify Functions configuration..."

# 检查是否有环境变量配置
if [ -f .env ]; then
  echo "✅ Found .env file"
  cat .env | grep -v "^#" | grep "="
else
  echo "❌ No .env file found"
fi

# 检查 netlify.toml 配置
echo -e "\n📋 Netlify configuration:"
grep -A 5 "\[functions\]" netlify.toml || echo "No functions config"
