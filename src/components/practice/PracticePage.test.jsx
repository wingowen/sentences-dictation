import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PracticePage from './PracticePage'

// Mock speech service
vi.mock('../../services/speechService', () => ({
  speak: vi.fn().mockResolvedValue(),
  cancelSpeech: vi.fn(),
  isSpeechSupported: vi.fn().mockReturnValue(true),
}))

// Mock debounce to execute immediately in tests
vi.mock('../../utils/debounce', () => ({
  debounce: (fn) => fn,
}))

const defaultProps = {
  translation: '这是一个测试句子',
  currentWords: [
    { word: 'this', phonetic: '/ðɪs/', translation: '这' },
    { word: 'is', phonetic: '/ɪz/', translation: '是' },
    { word: 'a', phonetic: '/ə/', translation: '一个' },
    { word: 'test', phonetic: '/test/', translation: '测试' },
  ],
  sentenceIndex: 0,
  totalSentences: 10,
  showOriginalText: false,
  originalSentence: 'This is a test.',
  practiceStats: {
    totalAttempts: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    accuracy: 80,
    streak: 2,
    longestStreak: 3,
  },
  practiceProgress: {
    local: {
      completedSentences: [0, 1, 2],
      correctSentences: [0, 1],
      lastPracticedIndex: 2,
      progressPercentage: 30,
    },
  },
  dataSource: 'local',
  autoNext: true,
  autoPlay: false,
  speechSupported: true,
  onComplete: vi.fn(),
  onNext: vi.fn(),
  onBack: vi.fn(),
  onToggleOriginalText: vi.fn(),
  onPlayAudio: vi.fn(),
  onResetStats: vi.fn(),
  onResetProgress: vi.fn(),
}

describe('PracticePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the practice layout with all key elements', () => {
    render(<PracticePage {...defaultProps} />)

    // Navigation bar
    expect(screen.getByText('返回')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // current index
    expect(screen.getByText('10')).toBeInTheDocument() // total

    // Translation
    expect(screen.getByText('这是一个测试句子')).toBeInTheDocument()

    // Spelling section
    expect(screen.getByText('听写练习')).toBeInTheDocument()
    expect(screen.getByText('沉浸式')).toBeInTheDocument()

    // Action buttons
    expect(screen.getByText('播放')).toBeInTheDocument()
    expect(screen.getByText('下一题')).toBeInTheDocument()
  })

  it('renders word input fields for each word', () => {
    render(<PracticePage {...defaultProps} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(4)
  })

  it('calls onBack when back button is clicked', () => {
    render(<PracticePage {...defaultProps} />)

    fireEvent.click(screen.getByText('返回'))
    expect(defaultProps.onBack).toHaveBeenCalled()
  })

  it('calls onNext when next button is clicked', () => {
    render(<PracticePage {...defaultProps} />)

    fireEvent.click(screen.getByText('下一题'))
    expect(defaultProps.onNext).toHaveBeenCalled()
  })

  it('calls onPlayAudio when play button is clicked', () => {
    render(<PracticePage {...defaultProps} />)

    fireEvent.click(screen.getByText('播放'))
    expect(defaultProps.onPlayAudio).toHaveBeenCalled()
  })

  it('calls onToggleOriginalText when eye icon is clicked', () => {
    render(<PracticePage {...defaultProps} />)

    // Find the toggle button by title
    const toggleBtn = screen.getByTitle('显示/隐藏原文')
    fireEvent.click(toggleBtn)
    expect(defaultProps.onToggleOriginalText).toHaveBeenCalled()
  })

  it('opens stats drawer when stats button is clicked', () => {
    render(<PracticePage {...defaultProps} />)

    const statsBtn = screen.getByTitle('查看统计')
    fireEvent.click(statsBtn)

    // Drawer should appear
    expect(screen.getByText('练习统计')).toBeInTheDocument()
    expect(screen.getByText('练习数据')).toBeInTheDocument()
  })

  it('shows original text when showOriginalText is true', () => {
    render(<PracticePage {...defaultProps} showOriginalText={true} />)

    expect(screen.getByText('原文')).toBeInTheDocument()
    expect(screen.getByText('This is a test.')).toBeInTheDocument()
  })

  it('does not show original text when showOriginalText is false', () => {
    render(<PracticePage {...defaultProps} showOriginalText={false} />)

    expect(screen.queryByText('原文')).not.toBeInTheDocument()
  })

  it('displays keyboard hints', () => {
    render(<PracticePage {...defaultProps} />)

    expect(screen.getByText('Tab')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('Esc')).toBeInTheDocument()
  })

  it('calculates progress bar width correctly', () => {
    render(<PracticePage {...defaultProps} sentenceIndex={4} totalSentences={10} />)

    const progressFill = document.querySelector('.practice-progress-fill')
    expect(progressFill).toHaveStyle({ width: '50%' })
  })

  it('renders stats drawer with correct data', () => {
    render(<PracticePage {...defaultProps} />)

    // Open drawer
    fireEvent.click(screen.getByTitle('查看统计'))

    // Check stats
    expect(screen.getByText('80%')).toBeInTheDocument() // accuracy
    expect(screen.getByText('2')).toBeInTheDocument() // streak
  })
})
