// src/components/ImmersiveSpelling.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImmersiveSpelling from './ImmersiveSpelling'

// 模拟 translation 和 currentWords
const mockTranslation = "这是一段测试翻译"
const mockWords = [
  { word: 'Hello' },
  { word: 'World' },
  { word: 'Test' }
]

describe('ImmersiveSpelling', () => {
  let mockOnComplete

  beforeEach(() => {
    mockOnComplete = vi.fn()
    // 确保输入框不会获得真实焦点（测试环境）
    HTMLInputElement.prototype.focus = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render translation display', () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={[]}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )
    expect(screen.getByText(mockTranslation)).toBeInTheDocument()
  })

  it('should render input boxes equal to word count', async () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={mockWords}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )

    // 等待输入框初始化完成（setTimeout 0）
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(3)
    }, { timeout: 1000 })
  })

  it('should have aria-label on each input', () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={mockWords}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )
    expect(screen.getByLabelText('单词 1 输入框')).toBeInTheDocument()
    expect(screen.getByLabelText('单词 2 输入框')).toBeInTheDocument()
    expect(screen.getByLabelText('单词 3 输入框')).toBeInTheDocument()
  })

  it('should auto-focus first input on mount', () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={mockWords}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )
    const firstInput = screen.getByLabelText('单词 1 输入框')
    expect(firstInput.focus).toHaveBeenCalled()
  })

  it('should call onComplete when all words are correct', async () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={mockWords}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )

    const inputs = screen.getAllByRole('textbox')

    // 逐个输入正确单词
    await act(async () => {
      await userEvent.type(inputs[0], 'Hello')
    })
    await act(async () => {
      await userEvent.type(inputs[1], 'World')
    })
    await act(async () => {
      await userEvent.type(inputs[2], 'Test')
    })

    // onComplete 应在短暂延迟后触发（300ms）
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(true)
    }, { timeout: 1000 })
  })

  it('should not trigger onComplete if any word is incorrect', async () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={mockWords}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )

    const inputs = screen.getAllByRole('textbox')

    // 输入两个正确，最后一个错误
    await act(async () => {
      await userEvent.type(inputs[0], 'Hello')
    })
    await act(async () => {
      await userEvent.type(inputs[1], 'World')
    })
    await act(async () => {
      await userEvent.type(inputs[2], 'Wrong')
    })

    // 等待足够长时间确保不会触发
    await waitFor(() => {
      expect(mockOnComplete).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('should apply correct class when word is correct', async () => {
    render(
      <ImmersiveSpelling
        translation={mockTranslation}
        currentWords={mockWords}
        sentenceIndex={0}
        onComplete={mockOnComplete}
      />
    )

    const input = screen.getByLabelText('单词 1 输入框')
    await act(async () => {
      await userEvent.type(input, 'Hello')
    })

    expect(input).toHaveClass('word-correct')
  })
})
