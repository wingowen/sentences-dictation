// netlify/functions/shared/url-validator.js
/**
 * URL白名单配置
 */
const ALLOWED_DOMAINS = [
  'newconceptenglish.com',
  'www.newconceptenglish.com'
];

/**
 * 验证URL是否在白名单中
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否允许
 */
export function isUrlAllowed(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return ALLOWED_DOMAINS.includes(hostname);
  } catch (error) {
    return false;
  }
}

/**
 * 验证URL是否为HTTP/HTTPS协议
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为有效协议
 */
export function isValidProtocol(url) {
  return url.startsWith('http://') || url.startsWith('https://');
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

  if (!isUrlAllowed(url)) {
    return { isValid: false, error: '域名不在白名单中' };
  }

  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: 'URL格式无效' };
  }
}