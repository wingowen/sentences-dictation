// src/utils/errors.js
/**
 * 错误码定义
 */
export const ERROR_CODES = {
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  API_ERROR: 'API_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  CACHE_ERROR: 'CACHE_ERROR',
  SPEECH_ERROR: 'SPEECH_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  IMPORT_ERROR: 'IMPORT_ERROR'
};

/**
 * 自定义错误类
 */
export class ServiceError extends Error {
  /**
   * @param {string} code - 错误码
   * @param {string} message - 错误消息
   * @param {Object} details - 额外详情
   */
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.name = 'ServiceError';
    this.details = details;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      name: this.name,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * 创建网络超时错误
 * @param {string} serviceName - 服务名称
 * @returns {ServiceError} 错误实例
 */
export function createTimeoutError(serviceName) {
  return new ServiceError(
    ERROR_CODES.NETWORK_TIMEOUT,
    `${serviceName}请求超时，请检查网络连接`,
    { serviceName }
  );
}

/**
 * 创建API错误
 * @param {string} apiName - API名称
 * @param {string} originalError - 原始错误消息
 * @returns {ServiceError} 错误实例
 */
export function createApiError(apiName, originalError) {
  return new ServiceError(
    ERROR_CODES.API_ERROR,
    `${apiName} API调用失败`,
    { apiName, originalError }
  );
}

/**
 * 创建输入验证错误
 * @param {string} fieldName - 字段名称
 * @param {string} reason - 原因
 * @returns {ServiceError} 错误实例
 */
export function createValidationError(fieldName, reason) {
  return new ServiceError(
    ERROR_CODES.INVALID_INPUT,
    `无效的${fieldName}: ${reason}`,
    { fieldName, reason }
  );
}

/**
 * 创建语音合成错误
 * @param {string} reason - 错误原因
 * @returns {ServiceError} 错误实例
 */
export function createSpeechError(reason) {
  return new ServiceError(
    ERROR_CODES.SPEECH_ERROR,
    `语音合成失败: ${reason}`,
    { reason }
  );
}

/**
 * 创建解析错误
 * @param {string} contentType - 内容类型
 * @param {string} originalError - 原始错误消息
 * @returns {ServiceError} 错误实例
 */
export function createParseError(contentType, originalError) {
  return new ServiceError(
    ERROR_CODES.PARSE_ERROR,
    `解析${contentType}失败`,
    { contentType, originalError }
  );
}

/**
 * 创建导入错误
 * @param {string} source - 导入源
 * @param {string} originalError - 原始错误消息
 * @returns {ServiceError} 错误实例
 */
export function createImportError(source, originalError) {
  return new ServiceError(
    ERROR_CODES.IMPORT_ERROR,
    `从${source}导入失败`,
    { source, originalError }
  );
}