import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DATA_SOURCE_TYPES } from '../services/dataService'
import ArticleSelectorHint from './ArticleSelectorHint'

describe('ArticleSelectorHint', () => {
  const mockArticles = [{ id: 1, title: 'Article 1' }]

  it('should render hint for NEW_CONCEPT_2 when no article is selected', () => {
    render(
      <ArticleSelectorHint
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_2}
        articles={mockArticles}
        selectedArticleId={null}
        isLoading={false}
      />
    )

    expect(screen.getByText('请在上方选择一篇文章开始练习')).toBeInTheDocument()
  })

  it('should not render when an article is selected', () => {
    const { container } = render(
      <ArticleSelectorHint
        dataSource={DATA_SOURCE_TYPES.NEW_CONCEPT_2}
        articles={mockArticles}
        selectedArticleId={'2-001'}
        isLoading={false}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})
