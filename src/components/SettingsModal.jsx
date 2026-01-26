import React, { useState } from 'react'
import { TRANSLATION_PROVIDERS, TRANSLATION_PROVIDER_NAMES } from '../services/translationService'

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
  translationProvider,
  onTranslationProviderChange,
  translationConfig,
  onTranslationConfigChange
}) => {
  const [activeTab, setActiveTab] = useState('speech')

  if (!isOpen) return null

  const handleConfigChange = (key, value) => {
    onTranslationConfigChange({
      ...translationConfig,
      [key]: value
    })
  }

  const tabs = [
    { id: 'speech', label: '语音' },
    { id: 'practice', label: '练习' },
    { id: 'translation', label: '翻译' }
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

                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={listenMode}
                    onChange={(e) => onToggleListenMode(e.target.checked)}
                    disabled={!speechSupported}
                  />
                  <span>听句子模式</span>
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

          {activeTab === 'translation' && (
            <div className="settings-panel">
              <div className="settings-section">
                <h3>翻译设置</h3>

                <div className="settings-description">
                  选择翻译服务提供商以获得更好的翻译效果
                </div>

                <label className="settings-option">
                  <span className="settings-label">翻译服务:</span>
                  <select
                    value={translationProvider}
                    onChange={(e) => onTranslationProviderChange(e.target.value)}
                    className="settings-select"
                  >
                    <option value={TRANSLATION_PROVIDERS.MYMEMORY}>
                      {TRANSLATION_PROVIDER_NAMES[TRANSLATION_PROVIDERS.MYMEMORY]} (免费)
                    </option>
                    <option value={TRANSLATION_PROVIDERS.LIBRETRANSLATE}>
                      {TRANSLATION_PROVIDER_NAMES[TRANSLATION_PROVIDERS.LIBRETRANSLATE]} (免费)
                    </option>
                    <option value={TRANSLATION_PROVIDERS.GOOGLE}>
                      {TRANSLATION_PROVIDER_NAMES[TRANSLATION_PROVIDERS.GOOGLE]} (需 API Key)
                    </option>
                    <option value={TRANSLATION_PROVIDERS.DEEPL}>
                      {TRANSLATION_PROVIDER_NAMES[TRANSLATION_PROVIDERS.DEEPL]} (需 API Key)
                    </option>
                    <option value={TRANSLATION_PROVIDERS.BAIDU}>
                      {TRANSLATION_PROVIDER_NAMES[TRANSLATION_PROVIDERS.BAIDU]} (需 APP ID)
                    </option>
                  </select>
                </label>

                {translationProvider === TRANSLATION_PROVIDERS.GOOGLE && (
                  <>
                    <div className="settings-option">
                      <span className="settings-label">Google API Key:</span>
                      <input
                        type="password"
                        value={translationConfig.googleApiKey || ''}
                        onChange={(e) => handleConfigChange('googleApiKey', e.target.value)}
                        className="settings-input"
                        placeholder="输入 API Key"
                      />
                    </div>
                    <div className="settings-note">
                      获取 API Key: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                    </div>
                  </>
                )}

                {translationProvider === TRANSLATION_PROVIDERS.DEEPL && (
                  <>
                    <div className="settings-option">
                      <span className="settings-label">DeepL API Key:</span>
                      <input
                        type="password"
                        value={translationConfig.deeplApiKey || ''}
                        onChange={(e) => handleConfigChange('deeplApiKey', e.target.value)}
                        className="settings-input"
                        placeholder="输入 API Key"
                      />
                    </div>
                    <div className="settings-note">
                      获取免费 API Key: <a href="https://www.deepl.com/pro-api" target="_blank" rel="noopener noreferrer">DeepL</a>
                    </div>
                  </>
                )}

                {translationProvider === TRANSLATION_PROVIDERS.LIBRETRANSLATE && (
                  <>
                    <div className="settings-option">
                      <span className="settings-label">API URL:</span>
                      <input
                        type="text"
                        value={translationConfig.libreApiUrl || 'https://libretranslate.com/translate'}
                        onChange={(e) => handleConfigChange('libreApiUrl', e.target.value)}
                        className="settings-input"
                        placeholder="https://libretranslate.com/translate"
                      />
                    </div>
                    <div className="settings-note">
                      使用公共实例或自建 LibreTranslate 服务
                    </div>
                  </>
                )}

                {translationProvider === TRANSLATION_PROVIDERS.BAIDU && (
                  <>
                    <div className="settings-option">
                      <span className="settings-label">APP ID:</span>
                      <input
                        type="text"
                        value={translationConfig.baiduAppId || ''}
                        onChange={(e) => handleConfigChange('baiduAppId', e.target.value)}
                        className="settings-input"
                        placeholder="输入 APP ID"
                      />
                    </div>
                    <div className="settings-option">
                      <span className="settings-label">密钥:</span>
                      <input
                        type="password"
                        value={translationConfig.baiduSecretKey || ''}
                        onChange={(e) => handleConfigChange('baiduSecretKey', e.target.value)}
                        className="settings-input"
                        placeholder="输入密钥"
                      />
                    </div>
                    <div className="settings-note">
                      获取 APP ID 和密钥: <a href="https://fanyi-api.baidu.com/" target="_blank" rel="noopener noreferrer">百度翻译开放平台</a>
                    </div>
                  </>
                )}

                <div className="settings-info">
                  <strong>翻译服务对比：</strong>
                  <ul>
                    <li><strong>MyMemory</strong>：完全免费，每日 5000 词，翻译质量一般</li>
                    <li><strong>LibreTranslate</strong>：完全开源免费，公共实例可能有速率限制</li>
                    <li><strong>Google</strong>：翻译质量好，每月 50 万字符免费</li>
                    <li><strong>DeepL</strong>：翻译质量最佳，每月 50 万字符免费</li>
                    <li><strong>百度</strong>：对中文优化好，每月 500 万字符免费</li>
                  </ul>
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
