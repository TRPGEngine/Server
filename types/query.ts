/**
 * 分页类型
 */
export interface Pagination<T> {
  count: number;
  list: T[];
}
