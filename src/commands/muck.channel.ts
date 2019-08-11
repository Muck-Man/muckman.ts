import { Command } from 'detritus-client';

import { fetchStatsChannel } from '../api';
import { MuckContextTypes, MuckStatTypes } from '../constants';
import { formatMuck, Parameters } from '../utils';


export default (<Command.CommandOptions> {
  name: 'channel',
  aliases: ['channelstats', 'channelinfo'],
  label: 'channel',
  prefixes: ['m', 'muck'],
  prefixSpace: true,
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  type: Parameters.channel,
  onBefore: (context) => {
    const channel = context.channel;
    return (channel) ? channel.canEmbedLinks : false;
  },
  onCancel: (context) => context.reply('⚠ Unable to embed information in this channel.'),
  onBeforeRun: (context, args) => !!args.channel,
  onCancelRun: (context) => context.reply('⚠ Unable to find that channel.'),
  run: async (context, args) => {
    const stats = await fetchStatsChannel(context, args.channel.id);
    const embed = formatMuck(MuckContextTypes.CHANNEL, {
      content: args.content,
      context,
      stats,
      statsContext: args.channel,
      statsType: MuckStatTypes.CHANNEL,
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
