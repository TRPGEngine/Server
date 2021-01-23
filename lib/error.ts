export const errorCode = {
  LIMITED: 10001, // 请求受限
  EXPIRED: 10002, // 已过期
  NOT_FOUND: 10003, // 找不到
};

/**
 * 该错误不会在Report服务中被上报
 */
export class NoReportError extends Error {
  name = 'NoReportError';
}

/**
 * 请求受限
 */
export class LimitedError extends NoReportError {
  name = 'LimitedError';
  code = errorCode.LIMITED;
}

/**
 * 已过期
 */
export class ExpiredError extends NoReportError {
  name = 'ExpiredError';
  code = errorCode.EXPIRED;
}

/**
 * 未找到
 */
export class NotFoundError extends NoReportError {
  name = 'NotFoundError';
  code = errorCode.NOT_FOUND;
}
