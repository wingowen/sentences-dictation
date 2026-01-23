// src/utils/errors.test.js
import { describe, it, expect } from 'vitest'
import {
  ERROR_CODES,
  ServiceError,
  createTimeoutError,
  createApiError,
  createValidationError,
  createSpeechError,
  createParseError,
  createImportError
} from './errors'

describe('errors', () => {
  describe('ERROR_CODES', () => {
    it('should contain all expected error codes', () => {
      expect(ERROR_CODES.NETWORK_TIMEOUT).toBe('NETWORK_TIMEOUT')
      expect(ERROR_CODES.API_ERROR).toBe('API_ERROR')
      expect(ERROR_CODES.INVALID_INPUT).toBe('INVALID_INPUT')
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND')
      expect(ERROR_CODES.SPEECH_ERROR).toBe('SPEECH_ERROR')
      expect(ERROR_CODES.PARSE_ERROR).toBe('PARSE_ERROR')
      expect(ERROR_CODES.IMPORT_ERROR).toBe('IMPORT_ERROR')
    })
  })

  describe('ServiceError', () => {
    it('should create error with correct properties', () => {
      const error = new ServiceError('TEST_ERROR', 'Test message', { key: 'value' })

      expect(error.code).toBe('TEST_ERROR')
      expect(error.message).toBe('Test message')
      expect(error.name).toBe('ServiceError')
      expect(error.details).toEqual({ key: 'value' })
      expect(error.timestamp).toBeDefined()
    })

    it('should serialize to JSON correctly', () => {
      const error = new ServiceError('TEST_ERROR', 'Test message', { key: 'value' })
      const json = error.toJSON()

      expect(json.code).toBe('TEST_ERROR')
      expect(json.message).toBe('Test message')
      expect(json.name).toBe('ServiceError')
      expect(json.details).toEqual({ key: 'value' })
      expect(json.timestamp).toBeDefined()
    })
  })

  describe('factory functions', () => {
    it('should create timeout error', () => {
      const error = createTimeoutError('API')
      expect(error.code).toBe(ERROR_CODES.NETWORK_TIMEOUT)
      expect(error.message).toContain('API请求超时')
      expect(error.details.serviceName).toBe('API')
    })

    it('should create API error', () => {
      const error = createApiError('Notion', 'Connection failed')
      expect(error.code).toBe(ERROR_CODES.API_ERROR)
      expect(error.message).toContain('Notion API调用失败')
      expect(error.details.apiName).toBe('Notion')
      expect(error.details.originalError).toBe('Connection failed')
    })

    it('should create validation error', () => {
      const error = createValidationError('email', 'invalid format')
      expect(error.code).toBe(ERROR_CODES.INVALID_INPUT)
      expect(error.message).toContain('无效的email')
      expect(error.details.fieldName).toBe('email')
      expect(error.details.reason).toBe('invalid format')
    })

    it('should create speech error', () => {
      const error = createSpeechError('synthesis failed')
      expect(error.code).toBe(ERROR_CODES.SPEECH_ERROR)
      expect(error.message).toContain('语音合成失败')
      expect(error.details.reason).toBe('synthesis failed')
    })

    it('should create parse error', () => {
      const error = createParseError('JSON', 'invalid syntax')
      expect(error.code).toBe(ERROR_CODES.PARSE_ERROR)
      expect(error.message).toContain('解析JSON失败')
      expect(error.details.contentType).toBe('JSON')
      expect(error.details.originalError).toBe('invalid syntax')
    })

    it('should create import error', () => {
      const error = createImportError('flashcards', 'file not found')
      expect(error.code).toBe(ERROR_CODES.IMPORT_ERROR)
      expect(error.message).toContain('从flashcards导入失败')
      expect(error.details.source).toBe('flashcards')
      expect(error.details.originalError).toBe('file not found')
    })
  })
})