import Router from 'koa-router';
const router = new Router();
import _ from 'lodash';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { Op } from 'trpg/core';

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
