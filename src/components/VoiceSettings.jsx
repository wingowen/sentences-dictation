import React from 'react'

const VoiceSettings = ({ isOpen, onClose, speechService, onSpeechServiceChange, availableVoices, selectedVoice, onVoiceChange, externalVoices, selectedExternalVoice, onExternalVoiceChange }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '400px', maxWidth: '90%' }}>
        <div className="voice-settings-modal" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', fontSize: '1.2rem' }}>语音设置</h3>
          <div className="service-selector" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>语音服务:</span>
              <select
                value={speechService}
                onChange={(e) => onSpeechServiceChange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '0.9rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="web_speech">Web Speech API (浏览器内置)</option>
                <option value="uberduck">Uberduck.ai (外部服务)</option>
              </select>
            </label>
          </div>
          <div className="voice-selector" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>选择语音:</span>
              {speechService === 'web_speech' ? (
                <select
                  value={selectedVoice ? selectedVoice.name : ''}
                  onChange={(e) => {
                    const selectedVoiceName = e.target.value
                    const voice = availableVoices.find(v => v.name === selectedVoiceName)
                    if (voice) {
                      onVoiceChange(voice)
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedExternalVoice ? selectedExternalVoice.name : ''}
                  onChange={(e) => {
                    const selectedVoiceName = e.target.value
                    const voice = externalVoices.find(v => v.name === selectedVoiceName)
                    if (voice) {
                      onExternalVoiceChange(voice)
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {externalVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.displayName}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
          <button 
            type="button" 
            className="modal-close-button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#007bff',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              alignSelf: 'center',
              marginTop: '10px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0069d9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoiceSettings