import React, { useState } from 'react'

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

  if (!isOpen) return null

  const tabs = [
    { id: 'speech', label: '语音' },
    { id: 'practice', label: '练习' },
    { id: 'display', label: '显示' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close-btn" onClick={onClose} aria-label="关闭设置">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
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
