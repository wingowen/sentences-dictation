// netlify/functions/shared/url-validator.js
/**
 * 验证URL是否为HTTP/HTTPS协议
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为有效协议
 */
export function isValidProtocol(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * 验证URL是否指向私有网络地址（防止SSRF攻击）
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为私有地址
 */
export function isPrivateAddress(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // 检查私有IP地址
    const privateIpRegex = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.)/;
    if (privateIpRegex.test(hostname)) {
      return true;
    }

    // 检查localhost相关地址
    if (hostname === 'localhost' || hostname.startsWith('localhost.')) {
      return true;
    }

    // 检查内网域名
    const internalDomains = ['internal', 'intranet', 'local', 'dev', 'test'];
    if (internalDomains.some(domain => hostname.includes(domain))) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 完整的URL验证
 * @param {string} url - 要验证的URL
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL不能为空' };
  }

  if (!isValidProtocol(url)) {
    return { isValid: false, error: '仅允许HTTP和HTTPS协议' };
  }

  if (isPrivateAddress(url)) {
    return { isValid: false, error: '不允许访问私有网络地址' };
  }

  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: 'URL格式无效' };
  }
}