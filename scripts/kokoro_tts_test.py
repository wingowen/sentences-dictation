#!/usr/bin/env python3
"""
Kokoro TTS 测试脚本
生成示例音频并与 Edge TTS 对比
"""

import os
import sys
import time

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from kokoro_onnx import Kokoro
    import soundfile as sf
    print("✅ Kokoro TTS 导入成功")
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    print("请先安装依赖: pip install kokoro-onnx soundfile")
    sys.exit(1)

# 示例句子
SAMPLE_SENTENCES = [
    "Hello, how are you today?",
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect.",
]

OUTPUT_DIR = ".temp-audio"

def generate_kokoro_audio(text, output_path, voice="af_bella"):
    """使用 Kokoro TTS 生成音频"""
    # 初始化 Kokoro（会自动下载模型）
    kokoro = Kokoro("kokoro-v0_19.onnx", "voices.json")
    
    # 生成音频
    samples, sample_rate = kokoro.create(
        text=text,
        voice=voice,
        speed=1.0
    )
    
    # 保存音频
    sf.write(output_path, samples, sample_rate)
    return True

def main():
    print("🎙️  Kokoro TTS 测试\n")
    print("=" * 50)
    
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 测试不同声音
    voices = ["af_bella", "af_sarah", "am_adam", "am_michael"]
    
    for i, sentence in enumerate(SAMPLE_SENTENCES[:2], 1):
        print(f"\n[{i}/2] {sentence}")
        
        for voice in voices[:2]:  # 只测试前2个声音
            output_path = os.path.join(OUTPUT_DIR, f"kokoro-sample{i}-{voice}.wav")
            
            try:
                start_time = time.time()
                success = generate_kokoro_audio(sentence, output_path, voice)
                elapsed = time.time() - start_time
                
                if success:
                    file_size = os.path.getsize(output_path) / 1024  # KB
                    print(f"  ✅ {voice}: {elapsed:.2f}s, {file_size:.1f}KB -> {output_path}")
                else:
                    print(f"  ❌ {voice}: 生成失败")
                    
            except Exception as e:
                print(f"  ❌ {voice}: {e}")
    
    print("\n" + "=" * 50)
    print("✅ 测试完成！")
    print(f"📁 音频文件保存在 {OUTPUT_DIR}/ 目录")
    print("\n可用声音:")
    for voice in voices:
        print(f"  - {voice}")

if __name__ == "__main__":
    main()
