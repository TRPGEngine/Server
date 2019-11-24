import { buildAppContext } from 'test/utils/app';
import { createTestGroup } from './example';
import { createTestActor } from 'packages/Actor/test/example';
import { GroupGroup } from '../lib/models/group';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { GroupActor } from '../lib/models/actor';
import { genTestPlayerJWT } from 'packages/Player/test/example';
import _ from 'lodash';

describe('Group router', () => {
  const context = buildAppContext();

  let testGroup: GroupGroup;
  let testActor: ActorActor;

  beforeAll(async () => {
    testGroup = await createTestGroup();
    testActor = await createTestActor();
  });

  afterAll(async () => {
    await _.invoke(testGroup, 'destroy');
    await _.invoke(testActor, 'destroy');
  });

  describe('POST /group/:groupUUID/actor/apply should be ok', () => {
    test('not login', async () => {
      const { status, body } = await context.request.post(
        `/group/${testGroup.uuid}/actor/apply`,
        {
          actorUUID: testActor.uuid,
        }
      );

      expect(status).toBe(401);
      expect(body).toMatchObject({
        result: false,
        msg: 'Unauthorized',
      });
    });

    test('logined', async () => {
      const { status, body } = await context.request.post(
        `/group/${testGroup.uuid}/actor/apply`,
        {
          actorUUID: testActor.uuid,
        },
        {
          'X-Token': await genTestPlayerJWT(),
        }
      );

      expect(status).toBe(200);
      expect(body).toHaveProperty('actor');
      expect(body.result).toBe(true);
      const actor = body.actor;
      expect(actor).toHaveProperty('uuid');
      expect(typeof actor.uuid).toBe('string');
      expect(actor).toHaveProperty('name');
      expect(actor).toHaveProperty('actor_uuid');
      expect(actor).toHaveProperty('actor_info');
      expect(actor).toHaveProperty('passed');
      expect(actor).toHaveProperty('actor');
      expect(actor).toHaveProperty('group');
      expect(actor.passed).toBe(false);

      await GroupActor.destroy({
        where: {
          uuid: actor.uuid,
        },
      });
    });
  });
});
