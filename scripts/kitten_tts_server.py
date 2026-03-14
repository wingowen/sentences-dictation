#!/usr/bin/env python3
"""
KittenTTS 本地服务器
轻量级本地 TTS，模型仅 25MB，无需 GPU

安装依赖:
  pip install kittentts soundfile fastapi uvicorn

启动:
  python3 scripts/kitten_tts_server.py

API:
  GET  /health          - 健康检查
  POST /tts             - 生成语音
    Body: {"text": "Hello", "voice": "Jasper", "speed": 1.0}
    Response: {"audio": "<base64_wav>", "sample_rate": 24000}

可用语音: Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki, Leo
"""

import base64
import io
import sys
import time

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
except ImportError:
    print("缺少依赖，请运行: pip install fastapi uvicorn")
    sys.exit(1)

# 延迟加载 KittenTTS（首次需要下载模型）
_model = None
AVAILABLE_VOICES = ['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo']


def get_model():
    global _model
    if _model is None:
        print("正在加载 KittenTTS 模型（首次需从 HuggingFace 下载约 25MB）...")
        from kittentts import KittenTTS
        _model = KittenTTS("KittenML/kitten-tts-mini-0.8")
        print("模型加载完成！")
    return _model


app = FastAPI(title="KittenTTS Server", version="1.0.0")

# CORS - 允许本地前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TTSRequest(BaseModel):
    text: str
    voice: str = "Jasper"
    speed: float = 1.0


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "KittenML/kitten-tts-mini-0.8",
        "available_voices": AVAILABLE_VOICES,
    }


@app.post("/tts")
def generate_tts(req: TTSRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(400, "text 不能为空")

    if req.voice not in AVAILABLE_VOICES:
        raise HTTPException(400, f"voice 必须是: {AVAILABLE_VOices}")

    try:
        model = get_model()
        start = time.time()

        # 生成音频
        audio = model.generate(req.text, voice=req.voice)

        # 转换为 WAV base64
        import soundfile as sf
        buf = io.BytesIO()
        sf.write(buf, audio, 24000, format='WAV')
        buf.seek(0)
        audio_b64 = base64.b64encode(buf.read()).decode()

        elapsed = time.time() - start
        print(f"TTS 生成: '{req.text[:50]}...' ({len(audio)} samples, {elapsed:.2f}s)")

        return {
            "audio": audio_b64,
            "sample_rate": 24000,
            "format": "wav",
            "duration_ms": int(len(audio) / 24000 * 1000),
        }
    except Exception as e:
        print(f"TTS 生成失败: {e}")
        raise HTTPException(500, f"TTS 生成失败: {str(e)}")


@app.get("/voices")
def list_voices():
    return {"voices": AVAILABLE_VOICES}


if __name__ == "__main__":
    print("=" * 50)
    print("KittenTTS 本地服务器")
    print("模型: KittenML/kitten-tts-mini-0.8 (25MB)")
    print("语音: " + ", ".join(AVAILABLE_VOICES))
    print("地址: http://127.0.0.1:8765")
    print("=" * 50)
    uvicorn.run(app, host="127.0.0.1", port=8765, log_level="warning")
