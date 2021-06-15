import { buildAppContext } from 'test/utils/app';
import {
  createTestActor,
  createTestGroupActor,
} from 'packages/Actor/test/example';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import { genTestPlayerJWT } from 'packages/Player/test/example';
import _ from 'lodash';
import testExampleStack from 'test/utils/example';
import { GroupGroup } from 'packages/Group/lib/models/group';
import { GroupActor } from '../lib/models/group-actor';
import { createTestGroup } from 'packages/Group/test/example';

const context = buildAppContext();

testExampleStack.regAfterAll();

describe('Group Actor Router', () => {
  let testGroup: GroupGroup;
  let testActor: ActorActor;
  let testGroupActor: GroupActor;

  beforeAll(async () => {
    testGroup = await createTestGroup();
    testActor = await createTestActor();
    testGroupActor = await createTestGroupActor(testGroup.id);
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
      expect(actor.passed).toBe(false);

      await GroupActor.destroy({
        where: {
          uuid: actor.uuid,
        },
      });
    });
  });

  test('POST /group/:groupUUID/actor/agree', async () => {
    const testGroupActorTmp = await createTestGroupActor(testGroup.id);
    const { body } = await context.request.post(
      `/group/${testGroup.uuid}/actor/agree`,
      {
        groupActorUUID: testGroupActorTmp.uuid,
      },
      {
        'X-Token': await genTestPlayerJWT(),
      }
    );

    expect(body).toBeSuccess();
    expect(body).toHaveProperty('groupActor');
    expect(_.get(body, 'groupActor.passed')).toBe(true);

    const groupActor = await GroupActor.findOne({
      where: {
        uuid: testGroupActorTmp.uuid,
      },
    });

    expect(groupActor.passed).toBe(true);
  });

  test('POST /group/:groupUUID/actor/refuse', async () => {
    const testGroupActorTmp = await createTestGroupActor(testGroup.id);
    const { body } = await context.request.post(
      `/group/${testGroup.uuid}/actor/refuse`,
      {
        groupActorUUID: testGroupActorTmp.uuid,
      },
      {
        'X-Token': await genTestPlayerJWT(),
      }
    );

    expect(body).toBeSuccess();

    const groupActor = await GroupActor.findOne({
      where: {
        uuid: testGroupActorTmp.uuid,
      },
    });

    expect(groupActor).toBeNull();
  });
});
