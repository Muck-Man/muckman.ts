import { Command } from 'detritus-client';

import { fetchStatsGlobal } from '../api';
import { MuckContextTypes, MuckStatTypes } from '../constants';
import { formatMuck } from '../utils';


export default (<Command.CommandOptions> {
  name: 'global',
  aliases: ['globalstats', 'globalinfo'],
  prefixes: ['m', 'muck'],
  prefixSpace: true,
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  onBefore: (context) => {
    const channel = context.channel;
    return (channel) ? channel.canEmbedLinks : false;
  },
  onCancel: (context) => context.editOrReply('⚠ Unable to embed information in this channel.'),
  run: async (context, args) => {
    const stats = await fetchStatsGlobal(context);
    const embed = formatMuck(MuckContextTypes.GLOBAL, {
      content: args.content,
      context,
      stats,
    });
    return context.editOrReply({embed});
  },
  onError: (context, args, error) => {
    console.error(error);
  },
  onRunError: (context, args, error) => {
    console.error(error);
  },
  onTypeError: (context, error) => {
    console.error(error);
  },
});
