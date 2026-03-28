import React from 'react'
import { DATA_SOURCES } from '../services/dataService'

const DataSourceSelection = ({ dataSourceError, onSelectDataSource, currentUser, onLoginClick }) => {
  return (
    <div className="data-source-selection-page">
      <div className="auth-floating-btn">
        <button
          className={currentUser ? "auth-btn logged-in" : "auth-btn"}
          onClick={onLoginClick}
          title={currentUser ? currentUser.email : "登录"}
        >
          <span className="auth-btn-icon">
            {currentUser ? '👤' : '🔐'}
          </span>
          <span className="auth-btn-text">
            {currentUser ? '已登录' : '登录'}
          </span>
        </button>
      </div>
      
      <div className="selection-container">
        <div className="selection-header">
          <h1>选择数据源</h1>
        </div>
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