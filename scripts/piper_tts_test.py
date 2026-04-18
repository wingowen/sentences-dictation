#!/usr/bin/env python3
"""
Piper TTS 测试脚本
生成示例音频并与 Edge TTS 对比
"""

import os
import sys
import time
import urllib.request

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from piper import PiperVoice
    import soundfile as sf
    print("✅ Piper TTS 导入成功")
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    print("请先安装依赖: pip install piper-tts")
    sys.exit(1)

# 示例句子
SAMPLE_SENTENCES = [
    "Hello, how are you today?",
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect.",
]

OUTPUT_DIR = ".temp-audio"
MODELS_DIR = ".piper-models"

# Piper 模型配置
MODELS = {
    "en_US-lessac-medium": {
        "url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx",
        "config_url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json",
    },
    "en_US-amy-medium": {
        "url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx",
        "config_url": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx.json",
    },
}

def download_model(model_name):
    """下载 Piper 模型"""
    model_dir = os.path.join(MODELS_DIR, model_name)
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, f"{model_name}.onnx")
    config_path = os.path.join(model_dir, f"{model_name}.onnx.json")
    
    model_info = MODELS[model_name]
    
    # 下载模型文件
    if not os.path.exists(model_path):
        print(f"  📥 下载模型: {model_name}.onnx")
        try:
            urllib.request.urlretrieve(model_info["url"], model_path)
            print(f"  ✅ 模型下载完成")
        except Exception as e:
            print(f"  ❌ 模型下载失败: {e}")
            return None, None
    
    # 下载配置文件
    if not os.path.exists(config_path):
        print(f"  📥 下载配置: {model_name}.onnx.json")
        try:
            urllib.request.urlretrieve(model_info["config_url"], config_path)
            print(f"  ✅ 配置下载完成")
        except Exception as e:
            print(f"  ❌ 配置下载失败: {e}")
            return None, None
    
    return model_path, config_path

def generate_piper_audio(text, output_path, model_name="en_US-lessac-medium"):
    """使用 Piper TTS 生成音频"""
    # 下载模型
    model_path, config_path = download_model(model_name)
    if not model_path:
        return False
    
    # 加载模型
    voice = PiperVoice.load(model_path, config_path)
    
    # 生成音频
    with open(output_path, "wb") as f:
        voice.synthesize(text, f)
    
    return True

def main():
    print("🎙️  Piper TTS 测试\n")
    print("=" * 50)
    
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # 测试不同声音
    voices = ["en_US-lessac-medium", "en_US-amy-medium"]
    
    for i, sentence in enumerate(SAMPLE_SENTENCES[:2], 1):
        print(f"\n[{i}/2] {sentence}")
        
        for voice in voices:
            output_path = os.path.join(OUTPUT_DIR, f"piper-sample{i}-{voice.replace('_', '-')}.wav")
            
            try:
                start_time = time.time()
                success = generate_piper_audio(sentence, output_path, voice)
                elapsed = time.time() - start_time
                
                if success and os.path.exists(output_path):
                    file_size = os.path.getsize(output_path) / 1024  # KB
                    print(f"  ✅ {voice}: {elapsed:.2f}s, {file_size:.1f}KB -> {output_path}")
                else:
                    print(f"  ❌ {voice}: 生成失败")
                    
            except Exception as e:
                print(f"  ❌ {voice}: {e}")
    
    print("\n" + "=" * 50)
    print("✅ 测试完成！")
    print(f"📁 音频文件保存在 {OUTPUT_DIR}/ 目录")
    print(f"📁 模型文件保存在 {MODELS_DIR}/ 目录")
    print("\n可用声音:")
    for voice in voices:
        print(f"  - {voice}")

if __name__ == "__main__":
    main()
