import { ActorTemplate } from 'packages/Actor/lib/models/template';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import testExampleStack from 'test/utils/example';
import { getTestUser } from 'packages/Player/test/example';
import { createTestGroup } from 'packages/Group/test/example';
import { GroupActor } from 'packages/Actor/lib/models/group-actor';

export const createTestActor = async (): Promise<ActorActor> => {
  const testUser = await getTestUser();
  const firstTemplate = await ActorTemplate.findOne(); // 获取一个模板UUID
  const actor: ActorActor = await ActorActor.create({
    name: 'test actor name',
    desc: '',
    avatar: '',
    template_uuid: firstTemplate.uuid,
    info: {
      data: '测试属性',
    },
    ownerId: testUser.id,
  });

  testExampleStack.append(actor);

  return actor;
};

/**
 * 如果没有给团ID， 则创建一个新的团作为该团人物卡的所在团
 * @param groupId 团ID
 */
export const testGroupActorInfo = { a: '1', b: '2' };
export const createTestGroupActor = async (
  groupId?: number,
  actorId?: number
): Promise<GroupActor> => {
  if (!_.isNumber(groupId)) {
    const group = await createTestGroup();
    groupId = group.id;
  }

  const testUser = await getTestUser();

  const groupActor: GroupActor = await GroupActor.create({
    actor_uuid: 'test_actor',
    actor_info: testGroupActorInfo,
    name: 'test',
    groupId,
    actorId,
    ownerId: testUser.id,
  });

  testExampleStack.append(groupActor);

  return groupActor;
};
