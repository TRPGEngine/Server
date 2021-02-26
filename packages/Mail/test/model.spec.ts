import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { MailRecord } from '../lib/models/record';

const context = buildAppContext();

regAutoClear();

describe('MailRecord', () => {
  test.skip('sendMail should be ok', async () => {
    const info = await MailRecord.sendMail({
      to: 'moonrailgun@gmail.com',
      subject: 'test',
      html: '<h1>这是一封测试邮件</h1>',
    });

    console.log('info', info);
  });
});
