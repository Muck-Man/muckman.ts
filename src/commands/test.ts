import { Command, Utils } from 'detritus-client';

import { Paginator } from '../utils/paginator';


export default (<Command.CommandOptions> {
  name: 'test',
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  onBefore: (context) => context.user.isClientOwner,
  run: async (context) => {
    const paginator = new Paginator(context, {
      emojis: {
        stop: '<a:old_man_walking:401059236882415616>',
      },
      onError: (error) => {
        console.log(error.response && error.response.request.route);
      },
      onPage: (page) => {
        const embed = new Utils.Embed();
        embed.setTitle(`Page ${page}`);
        return embed;
      },
      onExpire: console.log,
    });
    await paginator.start();
  },
});
