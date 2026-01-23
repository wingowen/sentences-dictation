// src/components/ArticleSelector.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DATA_SOURCE_TYPES } from '../services/dataService'
import ArticleSelector from './ArticleSelector'

describe('ArticleSelector', () => {
  const mockArticles = [
    { id: 1, title: 'Article 1' },
    { id: 2, title: 'Article 2' }
  ]

  it('should not render when dataSource is not NEW_CONCEPT_3', () => {
    const { container } = render(
      <ArticleSelector
        dataSource={DATA_SOURCE_TYPES.LOCAL}
        articles={mockArticles}
        selectedArticleId={null}
        onArticleChange={() => {}}
        isLoading={false}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should not render when articles array is empty', () => {
    const { container } = render(
      <ArticleSelector
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_3}
        articles={[]}
        selectedArticleId={null}
        onArticleChange={() => {}}
        isLoading={false}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render select with articles', () => {
    render(
      <ArticleSelector
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_3}
        articles={mockArticles}
        selectedArticleId={null}
        onArticleChange={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText('选择文章:')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('请选择文章')).toBeInTheDocument()
    expect(screen.getByText('Article 1')).toBeInTheDocument()
    expect(screen.getByText('Article 2')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <ArticleSelector
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_3}
        articles={mockArticles}
        selectedArticleId={null}
        onArticleChange={() => {}}
        isLoading={true}
      />
    )

    expect(screen.getByDisplayValue('加载中...')).toBeInTheDocument()
  })

  it('should call onArticleChange when selection changes', () => {
    const mockOnChange = vi.fn()

    render(
      <ArticleSelector
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_3}
        articles={mockArticles}
        selectedArticleId={null}
        onArticleChange={mockOnChange}
        isLoading={false}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })

    expect(mockOnChange).toHaveBeenCalledWith(1)
  })

  it('should handle null selectedArticleId', () => {
    render(
      <ArticleSelector
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_3}
        articles={mockArticles}
        selectedArticleId={1}
        onArticleChange={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByDisplayValue('Article 1')).toBeInTheDocument()
  })
})