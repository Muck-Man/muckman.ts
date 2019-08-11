import { Command, Structures } from 'detritus-client';

import { fetchStatsUser } from '../api';
import { MuckContextTypes, MuckStatTypes } from '../constants';
import { formatMuck, Parameters } from '../utils';


export default (<Command.CommandOptions> {
  name: 'user',
  aliases: ['userstats', 'member', 'memberstats'],
  args: [
    {name: 'guild', type: Parameters.guild},
    {name: 'channel', type: Parameters.channel},
  ],
  label: 'user',
  prefixes: ['m', 'muck'],
  prefixSpace: true,
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  type: Parameters.memberOrUser,
  onBefore: (context) => {
    const channel = context.channel;
    return (channel) ? channel.canEmbedLinks : false;
  },
  onCancel: (context) => context.reply('⚠ Unable to embed information in this channel.'),
  onBeforeRun: (context, args) => !!args.user,
  onCancelRun: (context) => context.reply('⚠ Unable to find that guy.'),
  run: async (context, args) => {
    let statsContext: Structures.Channel | Structures.Guild | undefined;
    let statsType = MuckStatTypes.GLOBAL;
    if (args.channel) {
      statsContext = args.channel;
      statsType = MuckStatTypes.CHANNEL;
    }
    if (args.guild) {
      statsContext = args.guild;
      statsType = MuckStatTypes.GUILD;
    }
    const statsUser = args.user;

    const stats = await fetchStatsUser(context, statsUser.id, {
      contextId: (statsContext) ? statsContext.id : undefined,
      contextType: statsType,
    });
    const embed = formatMuck(MuckContextTypes.USER, {
      content: args.content,
      context,
      stats,
      statsContext,
      statsType,
      statsUser,
    });
    return context.reply({embed});
  },
  onError: (context, args, error) => {
    console.error(error);
  },
  onRunError: async (context, args, error) => {
    console.error(error.response);
    let statsContext: Structures.Channel | Structures.Guild | undefined;
    let statsType = MuckStatTypes.GLOBAL;
    if (args.channel) {
      statsContext = args.channel;
      statsType = MuckStatTypes.CHANNEL;
    }
    if (args.guild) {
      statsContext = args.guild;
      statsType = MuckStatTypes.GUILD;
    }
    const statsUser = args.user;

    const embed = formatMuck(MuckContextTypes.USER, {
      content: args.content,
      context,
      error: (error.response) ? await error.response.json() : error,
      statsContext,
      statsType,
      statsUser,
    });
    return context.reply({embed});
  },
  onTypeError: (context, error) => {
    console.error(error);
  },
});
