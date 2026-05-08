import React, { useState } from 'react'
import cacheService from '../services/cacheService'

const SettingsModal = ({
  isOpen,
  onClose,
  autoPlay,
  onToggleAutoPlay,
  randomMode,
  onToggleRandomMode,
  listenMode,
  onToggleListenMode,
  autoNext,
  onToggleAutoNext,
  showCounter,
  onToggleShowCounter,
  speechRate,
  onSpeechRateChange,
  speechSupported,
  showTranslation,
  onToggleTranslation,
  showOriginalText,
  onToggleOriginalText,
  currentTranslation,
}) => {
  const [activeTab, setActiveTab] = useState('speech')
  const [cacheCleared, setCacheCleared] = useState(false)

  const handleClearCache = () => {
    cacheService.clearAllCache()
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'speech', label: '语音' },
    { id: 'practice', label: '练习' },
    { id: 'display', label: '显示' },
    { id: 'data', label: '数据' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>设置</h2>

        {/* Tab 导航 */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className="settings-tab-content">
               {activeTab === 'speech' && (
                 <div className="settings-panel">
                   <div className="settings-section">
                     <h3>语音设置</h3>

                     <label className="settings-option">
                       <span className="settings-label">语速:</span>
                       <select
                         value={speechRate.toFixed(1)}
                         onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                         disabled={!speechSupported || listenMode}
                         className="settings-select"
                       >
                         <option value="0.5">0.5x (慢速)</option>
                         <option value="0.75">0.75x (较慢)</option>
                         <option value="1.0">1.0x (正常)</option>
                         <option value="1.25">1.25x (较快)</option>
                         <option value="1.5">1.5x (快速)</option>
                         <option value="2.0">2.0x (很快)</option>
                       </select>
                     </label>

                     <label className="settings-option">
                       <input
                         type="checkbox"
                         checked={autoPlay}
                         onChange={(e) => onToggleAutoPlay(e.target.checked)}
                         disabled={!speechSupported || listenMode}
                       />
                       <span>自动朗读</span>
                     </label>
                   </div>
                 </div>
               )}
                    
                    

          {activeTab === 'practice' && (
            <div className="settings-panel">
              <div className="settings-section">
                <h3>练习设置</h3>

                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={randomMode}
                    onChange={(e) => onToggleRandomMode(e.target.checked)}
                    disabled={listenMode}
                  />
                  <span>随机模式</span>
                </label>

                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={autoNext}
                    onChange={(e) => onToggleAutoNext(e.target.checked)}
                  />
                  <span>自动切换下一句</span>
                </label>

                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={showCounter}
                    onChange={(e) => onToggleShowCounter(e.target.checked)}
                  />
                  <span>显示字母计数器</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="settings-panel">
              <div className="settings-section">
                <h3>显示设置</h3>

                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => onToggleTranslation()}
                    disabled={!currentTranslation}
                  />
                  <span>显示中文翻译</span>
                </label>

                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={showOriginalText}
                    onChange={(e) => onToggleOriginalText()}
                  />
                  <span>显示原文</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-panel">
              <div className="settings-section">
                <h3>数据管理</h3>

                <div className="settings-option">
                  <button
                    onClick={handleClearCache}
                    className="settings-button"
                  >
                    清除所有缓存
                  </button>
                  {cacheCleared && (
                    <span className="settings-hint success">✓ 缓存已清除</span>
                  )}
                </div>

                <div className="settings-option">
                  <button
                    onClick={() => {
                      localStorage.clear()
                      window.location.reload()
                    }}
                    className="settings-button danger"
                  >
                    重置所有设置
                  </button>
                  <span className="settings-hint">将清除所有本地设置并刷新页面</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="settings-actions">
          <button className="settings-close-button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
