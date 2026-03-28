import React, { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  if (!message) return null
  
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
    </div>
  )
}

export default Toast
