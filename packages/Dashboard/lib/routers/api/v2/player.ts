import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { Op, TRPGRouter } from 'trpg/core';
const router = new TRPGRouter();

router.get('/search/fuzzy', async (ctx, next) => {
  const word = _.get(ctx, 'params.word', '');

  const list: PlayerUser = await PlayerUser.findAll({
    where: {
      [Op.or]: [
        {
          uuid: {
            [Op.like]: `%${word}%`,
          },
        },
        {
          username: {
            [Op.like]: `%${word}%`,
          },
        },
        {
          nickname: {
            [Op.like]: `%${word}%`,
          },
        },
      ],
    },
    attributes: ['id', 'uuid', 'username', 'nickname', 'name'],
    limit: 10,
  });

  ctx.body = {
    result: true,
    list,
  };
});

module.exports = router;
