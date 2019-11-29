import { ActorTemplate } from 'packages/Actor/lib/models/template';
import { ActorActor } from 'packages/Actor/lib/models/actor';

export const createTestActor = async (): Promise<ActorActor> => {
  const firstTemplate = await ActorTemplate.findOne(); // 获取一个模板UUID
  const group: ActorActor = await ActorActor.create({
    name: 'test actor name',
    desc: '',
    avatar: '',
    template_uuid: firstTemplate.uuid,
    info: {
      data: '测试属性',
    },
  });

  return group;
};
