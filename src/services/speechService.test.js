import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEdgeSpeak = vi.fn();
const mockIsEdgeTtsAvailable = vi.fn();
const mockEdgeCancelSpeech = vi.fn();

const mockPreloadedSpeak = vi.fn();
const mockHasPreloadedAudio = vi.fn();
const mockPreloadAudio = vi.fn();
const mockPreloadedCancelSpeech = vi.fn();

vi.mock('./edgeTtsService.js', () => ({
  speak: mockEdgeSpeak,
  isEdgeTtsAvailable: mockIsEdgeTtsAvailable,
  cancelSpeech: mockEdgeCancelSpeech,
}));

vi.mock('./preloadedAudioService.js', () => ({
  speak: mockPreloadedSpeak,
  hasPreloadedAudio: mockHasPreloadedAudio,
  preloadAudio: mockPreloadAudio,
  cancelSpeech: mockPreloadedCancelSpeech,
}));

describe('speechService fallback behavior', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockIsEdgeTtsAvailable.mockReturnValue(false);
    mockHasPreloadedAudio.mockResolvedValue(false);

    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
        this.rate = 1.0;
        this.onend = null;
        this.onerror = null;
      }
    };
  });

  it('falls back to browser SpeechSynthesis when Edge TTS fails', async () => {
    mockEdgeSpeak.mockRejectedValue(new Error('edge failed'));

    const synthesisSpeak = vi.fn((utterance) => {
      setTimeout(() => utterance.onend?.(), 0);
    });

    window.speechSynthesis.speak = synthesisSpeak;
    window.speechSynthesis.cancel = vi.fn();

    const { speak } = await import('./speechService.js');

    await expect(speak('hello world', 1.2)).resolves.toBeUndefined();
    expect(mockEdgeSpeak).toHaveBeenCalledWith('hello world', 1.2);
    expect(synthesisSpeak).toHaveBeenCalledTimes(1);
  });
});
