export const errorCode = {
  LIMITED: 10001, // 请求受限
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
