import React, { useState } from 'react'
import { DATA_SOURCES } from '../services/dataService'

const DataSourceSelection = ({ dataSourceError, onSelectDataSource }) => {
  const [showNewConceptBooks, setShowNewConceptBooks] = useState(false)
  return (
    <div className="data-source-selection-page">
      <div className="selection-container">
        <h1>选择数据源</h1>
        <p>请选择您想要练习的数据源开始拼写练习</p>
        {dataSourceError && (
          <div className="data-source-error">
            <span>警告: {dataSourceError}</span>
          </div>
        )}
        <div className="data-source-cards">
        {DATA_SOURCES.map((source) => {
          // Special handling for 新概念英语: single entry with sub-page books 1-4
          if (source.name === '新概念英语') {
            return (
              <button
                key={source.id}
                className="data-source-card"
                onClick={() => setShowNewConceptBooks(true)}
              >
                <div className="card-content">
                  <h3>{source.name}</h3>
                  <p>选择书本（1-4）</p>
                </div>
              </button>
            )
          }
          return (
            <button
              key={source.id}
              className="data-source-card"
              onClick={() => onSelectDataSource(source.id)}
            >
              <div className="card-content">
                <h3>{source.name}</h3>
                <p>{source.description}</p>
              </div>
            </button>
          )
        })}
        {/* Fallback: show 新概念英语 if not already in DATA_SOURCES */}
        {!DATA_SOURCES.some(s => s.name === '新概念英语') && (
          <button className="data-source-card" onClick={() => setShowNewConceptBooks(true)}>
            <div className="card-content">
              <h3>新概念英语</h3>
              <p>进入书本选择 (1-4)</p>
            </div>
          </button>
        )}
        </div>
      </div>
      {showNewConceptBooks && (
        <div className="data-source-subpage">
          <h3>新概念英语 - 选择书本</h3>
          <div className="new-concept-books">
            {[1,2,3,4].map(b => (
              <button key={b} onClick={() => { onSelectDataSource(`new_concept_english_book${b}`); setShowNewConceptBooks(false); }}>
                第 {b} 册
              </button>
            ))}
          </div>
          <button onClick={() => setShowNewConceptBooks(false)}>返回</button>
        </div>
      )}
    </div>
  )
}

export default DataSourceSelection
