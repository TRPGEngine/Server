import crypto from 'crypto';
import fs from 'fs';

/**
 * 计算文件的sha256值作为文件的唯一标识
 * @param file 文件路径或Buffer
 */
export function sha265File(file: Buffer): string {
  const sum = crypto.createHash('sha256');

  return sum.update(file).digest('hex');
}
