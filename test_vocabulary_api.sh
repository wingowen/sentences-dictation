#!/bin/bash

# 测试生词编辑 API 端点

# 登录获取 token
login_response=$(curl -X POST "https://sd-0721-dev.netlify.app/.netlify/functions/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"1318263468@qq.com","password":"123123"}')

echo "登录响应:"
echo $login_response

# 提取 token
token=$(echo $login_response | jq -r '.data?.token // .token')

if [ -z "$token" ]; then
  echo "登录失败，无法获取 token"
  exit 1
fi

echo "获取到 token: $token"

# 获取生词列表
vocab_list=$(curl -X GET "https://sd-0721-dev.netlify.app/api/vocabulary" \
  -H "Authorization: Bearer $token")

echo "\n生词列表:"
echo $vocab_list

# 提取第一个生词的 ID
first_vocab_id=$(echo $vocab_list | jq -r '.data.items[0]?.id')

if [ -z "$first_vocab_id" ] || [ "$first_vocab_id" = "null" ]; then
  echo "未找到生词，无法测试编辑功能"
  exit 1
fi

echo "\n第一个生词 ID: $first_vocab_id"

# 获取生词详情
vocab_detail=$(curl -X GET "https://sd-0721-dev.netlify.app/api/vocabulary/$first_vocab_id" \
  -H "Authorization: Bearer $token")

echo "\n生词详情:"
echo $vocab_detail

# 提取当前含义
current_meaning=$(echo $vocab_detail | jq -r '.data?.meaning // .meaning')

echo "\n当前含义: $current_meaning"

# 准备新的含义
new_meaning="$current_meaning (测试修改)"

echo "\n新的含义: $new_meaning"

# 测试更新生词
update_response=$(curl -X PUT "https://sd-0721-dev.netlify.app/api/vocabulary/$first_vocab_id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{"meaning":"'"$new_meaning"'"}')

echo "\n更新响应:"
echo $update_response

# 检查更新是否成功
success=$(echo $update_response | jq -r '.success')

echo "\n更新成功: $success"

if [ "$success" = "true" ]; then
  echo "✅ 测试成功：生词编辑功能正常工作"
else
  echo "❌ 测试失败：生词编辑功能出现问题"
  error_message=$(echo $update_response | jq -r '.error?.message // .message')
  echo "错误信息: $error_message"
fi