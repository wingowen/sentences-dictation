/**
 * API 响应格式化工具
 */

/**
 * 成功响应
 */
function success(data = null, message = '操作成功') {
  const responseBody = {
    success: true,
    message,
    ...(data && { data })
  };
  
  return {
    statusCode: 200,
    body: JSON.stringify(responseBody)
  };
}

/**
 * 分页响应
 */
function paginate(items, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    }
  };
}

/**
 * 错误响应
 */
function error(message, code = 'INTERNAL_ERROR', details = null, statusCode = 500) {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return {
    statusCode,
    body: JSON.stringify(response)
  };
}

/**
 * 验证错误
 */
function validationError(details) {
  return error(
    '请求数据验证失败',
    'VALIDATION_ERROR',
    details,
    400
  );
}

/**
 * 未找到错误
 */
function notFound(resource = '资源') {
  return error(
    `${resource}不存在`,
    'NOT_FOUND',
    null,
    404
  );
}

/**
 * 认证错误
 */
function unauthorized(message = '未认证') {
  return error(message, 'UNAUTHORIZED', null, 401);
}

/**
 * 权限错误
 */
function forbidden(message = '权限不足') {
  return error(message, 'FORBIDDEN', null, 403);
}

/**
 * 冲突错误
 */
function conflict(message, details = null) {
  return error(message, 'CONFLICT', details, 409);
}

module.exports = {
  success,
  paginate,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  conflict
};
