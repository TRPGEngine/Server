import _isUUID from 'is-uuid';

export function isUUID(str: string): boolean {
  return _isUUID.anyNonNil(str);
}
