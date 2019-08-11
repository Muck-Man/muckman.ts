import { Command } from 'detritus-client';

import { analyzeMuck } from '../api';
import { MuckContextTypes } from '../constants';
import { formatMuck } from '../utils';


export default (<Command.CommandOptions> {
  name: 'analyze',
  aliases: ['analyse'],
  label: 'content',
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
  onCancel: (context) => context.reply('⚠ Unable to embed information in this channel.'),
  onBeforeRun: (context, args) => !!args.content,
  onCancelRun: (context) => context.reply('⚠ Provide some content to analyze.'),
  run: async (context, args) => {
    const muck = await analyzeMuck(context, {
      channelId: context.channelId,
      content: context.content,
      guildId: context.guildId,
    });
    const embed = formatMuck(MuckContextTypes.ANALYZE, {
      content: args.content,
      context,
      muck,
    });
    return context.reply({embed});
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
