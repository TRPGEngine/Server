import { buildAppContext } from 'test/utils/app';
import {
  sendPostWithToken,
  getOtherTestUser,
} from 'packages/Player/test/example';
import { TRPGRecruit } from '../lib/models/recruit';
import { createTestRecruit } from './example';

const context = buildAppContext();

describe('recruit', () => {
  test('/trpg/recruit/create', async () => {
    const title = 'test title';
    const content = 'test content';
    const { body } = await sendPostWithToken(context, 'admin9')(
      '/trpg/recruit/create',
      {
        title,
        content,
      }
    );

    try {
      expect(body.result).toBe(true);
      expect(body).toHaveProperty('recruit');
      expect(body).toHaveProperty('recruit.uuid');
      expect(body).toHaveProperty('recruit.title');
      expect(body).toHaveProperty('recruit.content');
      expect(body).toHaveProperty('recruit.author');
      expect(body.recruit.title).toBe(title);
      expect(body.recruit.content).toBe(content);
      expect(body.recruit.author).toBe('admin9');

      const { body: body2 } = await sendPostWithToken(context, 'admin9')(
        '/trpg/recruit/create',
        {
          title,
          content,
        }
      );
      expect(body2).toMatchObject({
        result: false,
        msg: '不能在1天内发布多条招募信息',
      });
    } finally {
      await TRPGRecruit.destroy({
        where: {
          title,
          content,
        },
      });
    }
  });

  test('/trpg/recruit/:uuid/update', async () => {
    const testPlayer = await getOtherTestUser('admin8');
    const testRecruit = await createTestRecruit(testPlayer.id);
    const { body } = await sendPostWithToken(context, 'admin8')(
      `/trpg/recruit/${testRecruit.uuid}/update`,
      {
        content: 'new content',
      }
    );

    expect(body).toBeSuccess();
    expect(body).toHaveProperty('recruit');
    expect(body.recruit.title).toBe(testRecruit.title);
    expect(body.recruit.content).toBe('new content');
  });

  test('/trpg/recruit/:uuid/completed', async () => {
    const testPlayer = await getOtherTestUser('admin7');
    const testRecruit = await createTestRecruit(testPlayer.id);
    const { body } = await sendPostWithToken(context, 'admin7')(
      `/trpg/recruit/${testRecruit.uuid}/completed`,
      {}
    );

    expect(body).toBeSuccess();

    expect(
      await TRPGRecruit.findOne({ where: { uuid: testRecruit.uuid } })
    ).toHaveProperty('completed', true);
  });
});
