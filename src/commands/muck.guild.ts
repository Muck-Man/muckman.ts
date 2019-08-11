import { Command } from 'detritus-client';

import { fetchStatsGuild } from '../api';
import { MuckContextTypes, MuckStatTypes } from '../constants';
import { formatMuck, Parameters } from '../utils';


export default (<Command.CommandOptions> {
  name: 'guild',
  aliases: ['guildstats', 'guildinfo'],
  label: 'guild',
  prefixes: ['m', 'muck'],
  prefixSpace: true,
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  type: Parameters.guild,
  onBefore: (context) => {
    const channel = context.channel;
    return (channel) ? channel.canEmbedLinks : false;
  },
  onCancel: (context) => context.reply('⚠ Unable to embed information in this channel.'),
  onBeforeRun: (context, args) => !!args.guild,
  onCancelRun: (context) => context.reply('⚠ Unable to find that guild.'),
  run: async (context, args) => {
    const stats = await fetchStatsGuild(context, args.guild.id);
    const embed = formatMuck(MuckContextTypes.GUILD, {
      content: args.content,
      context,
      stats,
      statsContext: args.guild,
      statsType: MuckStatTypes.GUILD,
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
