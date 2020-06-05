/**
 * 该错误不会在Report服务中被上报
 */
export class NoReportError extends Error {
  name = 'NoReportError';
}
