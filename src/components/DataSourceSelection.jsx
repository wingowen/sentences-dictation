import React from 'react'
import { DATA_SOURCES } from '../services/dataService'

const DataSourceSelection = ({ dataSourceError, onSelectDataSource }) => {
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
          {DATA_SOURCES.map((source) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default DataSourceSelection