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
        <div className="auth-header">
          <h2>{isSignup ? '创建账号' : '欢迎回来'}</h2>
          <p className="auth-subtitle">
            {isSignup ? '开始你的学习之旅' : '登录以继续使用'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group auth-form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group auth-form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? '至少6位字符' : '请输入密码'}
              required
              minLength={isSignup ? 6 : undefined}
            />
          </div>

          {isSignup && (
            <div className="form-group auth-form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                required
              />
            </div>
          )}
          
          {error && (
            <div className="auth-message auth-error">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="auth-message auth-success">
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
              isSignup ? '创建账号' : '立即登录'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{isSignup ? '已有账号？' : '还没有账号？'}</span>
          <button type="button" className="auth-switch-btn" onClick={toggleMode}>
            {isSignup ? '立即登录' : '免费注册'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
