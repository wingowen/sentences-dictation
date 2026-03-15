// Netlify Function to generate TTS audio using Microsoft Edge TTS
// Fixed: node-edge-tts uses ttsPromise(text, filePath), not speak()
import { EdgeTTS } from 'node-edge-tts';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { CORS_HEADERS } from './shared/cors.js';

/**
 * Netlify Function handler
 */
export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  let tmpFile = null;

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { text, voice = 'en-US-AriaNeural', rate = 1.0 } = body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: 'Text parameter is required' })
      };
    }

    // Create temp file path
    tmpFile = join(tmpdir(), `tts-${randomBytes(8).toString('hex')}.mp3`);

    // Create EdgeTTS instance and configure
    const tts = new EdgeTTS();
    tts.voice(voice);
    // Convert rate (0.5-2.0) to Edge TTS format (-50% to +100%)
    const ratePercent = Math.round((rate - 1.0) * 100);
    tts.rate(`${ratePercent >= 0 ? '+' : ''}${ratePercent}%`);

    // Generate audio file (with 10s timeout)
    await Promise.race([
      tts.ttsPromise(text, tmpFile),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TTS generation timeout')), 10000))
    ]);

    // Read generated file
    const audioBuffer = readFileSync(tmpFile);
    const base64Audio = audioBuffer.toString('base64');

    // Cleanup temp file
    try { unlinkSync(tmpFile); } catch {}

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        audio: base64Audio,
        contentType: 'audio/mpeg'
      })
    };

  } catch (error) {
    console.error('TTS Generation Error:', error);
    // Cleanup temp file on error
    if (tmpFile) { try { unlinkSync(tmpFile); } catch {} }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: `Failed to generate audio: ${error.message}`
      })
    };
  }
}
