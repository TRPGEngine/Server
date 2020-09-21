import fs from 'fs';
import { getLogger } from '../logger';
const appLogger = getLogger('application');

/**
 * 初始化heapdumps
 * 每10分钟dump一次内存
 */
export function setupHeapDumps() {
  // Every 15 minutes
  const prefix = 'sm';
  dumpHeap(prefix);
  setInterval(() => {
    dumpHeap(prefix);
  }, 1000 * 60 * 15);
}

function dumpHeap(prefix: string) {
  try {
    if (!fs.existsSync('./logs/heapdump')) {
      fs.mkdirSync('./logs/heapdump');
    }
    const filename = `./logs/heapdump/${prefix}-${Date.now()}.heapsnapshot`;

    const heapdump = require('heapdump');
    heapdump.writeSnapshot(filename);
    appLogger.info(`Dumped heap at ${filename}`);
  } catch (err) {
    appLogger.error(err, 'Failed to dump heap');
  }
}
