// src/components/LocalResourceSelector.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DATA_SOURCE_TYPES } from '../services/dataService'
import LocalResourceSelector from './LocalResourceSelector'

describe('LocalResourceSelector', () => {
  const mockResources = [
    { id: 'simple', name: '简单句' },
    { id: 'new-concept-1', name: '新概念一' }
  ]

  it('should not render when dataSource is not LOCAL', () => {
    const { container } = render(
      <LocalResourceSelector
        dataSource={DATA_SOURCE_TYPES.NOTION}
        resources={mockResources}
        selectedResourceId="simple"
        onResourceChange={() => {}}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should not render when resources array is empty', () => {
    const { container } = render(
      <LocalResourceSelector
        dataSource={DATA_SOURCE_TYPES.LOCAL}
        resources={[]}
        selectedResourceId="simple"
        onResourceChange={() => {}}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render select with resources', () => {
    render(
      <LocalResourceSelector
        dataSource={DATA_SOURCE_TYPES.LOCAL}
        resources={mockResources}
        selectedResourceId="simple"
        onResourceChange={() => {}}
      />
    )

    expect(screen.getByText('选择本地资源:')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('简单句')).toBeInTheDocument()
    expect(screen.getByText('新概念一')).toBeInTheDocument()
  })

  it('should call onResourceChange when selection changes', () => {
    const mockOnChange = vi.fn()

    render(
      <LocalResourceSelector
        dataSource={DATA_SOURCE_TYPES.LOCAL}
        resources={mockResources}
        selectedResourceId="simple"
        onResourceChange={mockOnChange}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'new-concept-1' } })

    expect(mockOnChange).toHaveBeenCalledWith('new-concept-1')
  })

  it('should reflect selected resource', () => {
    render(
      <LocalResourceSelector
        dataSource={DATA_SOURCE_TYPES.LOCAL}
        resources={mockResources}
        selectedResourceId="new-concept-1"
        onResourceChange={() => {}}
      />
    )

    expect(screen.getByDisplayValue('新概念一')).toBeInTheDocument()
  })
})