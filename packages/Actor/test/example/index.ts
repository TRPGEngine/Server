import { ActorTemplate } from 'packages/Actor/lib/models/template';
import { ActorActor } from 'packages/Actor/lib/models/actor';
import testExampleStack from 'test/utils/example';
import { getTestUser } from 'packages/Player/test/example';

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
