// Netlify Function to generate TTS audio using Microsoft Edge TTS
import { EdgeTTS } from 'node-edge-tts';
import { CORS_HEADERS } from './shared/cors.js';

/**
 * Netlify Function handler
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Promise<Object>} - Response object
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

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { text, voice = 'en-US-AriaNeural', rate = 1.0 } = body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: 'Text parameter is required and must be a non-empty string' })
      };
    }

    // Validate rate (0.5 to 2.0)
    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate) || parsedRate < 0.5 || parsedRate > 2.0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: 'Rate must be a number between 0.5 and 2.0' })
      };
    }

    // Create EdgeTTS instance
    const tts = new EdgeTTS();

    // Generate audio stream
    const audioChunks = [];
    
    // Set timeout for TTS generation (10 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TTS generation timeout')), 10000);
    });

    const ttsPromise = new Promise(async (resolve, reject) => {
      try {
        // Configure TTS options
        const options = {
          voice: voice,
          rate: parsedRate,
          pitch: 0,
          volume: 0
        };

        // Generate audio stream
        const audioStream = await tts.speak(text, options);

        // Collect audio data chunks
        audioStream.on('data', (chunk) => {
          audioChunks.push(chunk);
        });

        audioStream.on('end', () => {
          // Combine all chunks into a single buffer
          const audioBuffer = Buffer.concat(audioChunks);
          resolve(audioBuffer);
        });

        audioStream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });

    // Wait for TTS generation with timeout
    const audioBuffer = await Promise.race([ttsPromise, timeoutPromise]);

    // Convert to base64
    const base64Audio = audioBuffer.toString('base64');

    // Return success response
    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        audio: base64Audio,
        contentType: 'audio/mpeg',
        duration: null // Could calculate if needed
      })
    };

  } catch (error) {
    console.error('TTS Generation Error:', error);

    // Return error response
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
