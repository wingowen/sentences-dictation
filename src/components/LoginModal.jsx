import React, { useState } from 'react'

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    if (isSignup && password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    try {
      const requestBody = isSignup
        ? { action: 'signup', email, password, confirmPassword }
        : { action: 'login', email, password }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (isSignup) {
          if (data.data.needsEmailConfirmation) {
            setSuccessMessage('注册成功！请检查邮箱完成验证。')
          } else {
            setSuccessMessage('注册成功！正在自动登录...')
            localStorage.setItem('auth_token', data.data.token)
            localStorage.setItem('current_user', JSON.stringify(data.data.user))
            setTimeout(() => {
              onLogin(data.data.user)
              onClose()
            }, 1500)
          }
        } else {
          localStorage.setItem('auth_token', data.data.token)
          localStorage.setItem('current_user', JSON.stringify(data.data.user))
          onLogin(data.data.user)
          onClose()
        }
      } else {
        setError(data.error?.message || (isSignup ? '注册失败' : '登录失败'))
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay auth-modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <div className="auth-header">
          <div className="auth-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2>{isSignup ? '欢迎注册' : '欢迎回来'}</h2>
          <p className="auth-subtitle">
            {isSignup ? '创建账号，开启学习之旅' : '登录后可以使用生词本功能'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group auth-form-group">
            <label htmlFor="email">邮箱</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div className="form-group auth-form-group">
            <label htmlFor="password">密码</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? '密码至少6位' : '输入密码'}
                required
                minLength={isSignup ? 6 : undefined}
              />
            </div>
          </div>

          {isSignup && (
            <div className="form-group auth-form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  required
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="auth-message auth-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="auth-message auth-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {successMessage}
            </div>
          )}
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-loading">
                <span className="spinner"></span>
                {isSignup ? '处理中...' : '登录中...'}
              </span>
            ) : (
              <>
                {isSignup ? '创建账号' : '立即登录'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{isSignup ? '已有账号？' : '还没有账号？'}</span>
          <button type="button" className="auth-switch-btn" onClick={toggleMode}>
            {isSignup ? '立即登录' : '免费注册'}
          </button>
        </div>
        
        {!isSignup && (
          <p className="auth-hint">
            测试账号: <code>admin@example.com</code> / <code>admin123</code>
          </p>
        )}
      </div>
    </div>
  )
}

export default LoginModal