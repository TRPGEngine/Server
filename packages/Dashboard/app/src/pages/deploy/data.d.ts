export interface DeployVersionType {
  id: number;
  version: string;
  platform: 'android' | 'ios' | 'windows' | 'mac' | 'linux';
  describe: string;
  createdAt: string;
}
