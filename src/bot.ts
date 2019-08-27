import {
  Constants,
  Structures,
} from 'detritus-client';

const { ActivityTypes, PresenceStatuses } = Constants;


import { analyzeMuck } from './api';
import { MuckMan } from './client';
import { MuckContextTypes } from './constants';
import { formatMuck } from './utils';


const muckMan = new MuckMan({
  activateOnEdits: true,
  cache: {
    members: {storeOffline: true},
  },
  directory: './commands',
  gateway: {
    identifyProperties: {
      $browser: 'Discord iOS',
    },
    presence: {
      activity: {
        name: 'for muck',
        type: ActivityTypes.WATCHING,
      },
      status: PresenceStatuses.ONLINE,
    },
  },
  mentionsEnabled: false,
  prefix: '!!',
  rest: {
    onNotOkResponse: (response) => {
      console.log(response.request.route, response.headers);
    },
  },
});

muckMan.on('COMMAND_NONE', async ({context}) => {
  if (context.message.fromBot || context.message.fromSystem) {
    return;
  }
  if (!context.message.content) {
    return;
  }

  const channel = context.channel;
  const guild = context.guild;

  let logChannel: Structures.Channel | undefined;
  if (guild) {
    const channels = guild.textChannels.filter((chnl) => {
      return (chnl.name === 'muck-logs' && chnl.canEmbedLinks);
    }).sort((x, y) => y.position - x.position);
    logChannel = channels.shift();
  }

  try {
    const muck = await analyzeMuck(context, {
      channelId: context.channelId,
      content: context.content,
      guildId: context.guildId,
    });

    if ((muck.channel && muck.channel.passed) || (muck.guild && muck.guild.passed)) {
      if (context.message.canDelete) {
        await context.message.delete();
      }
    } else {
      await analyzeMuck(context, {
        channelId: context.channelId,
        content: context.content,
        edited: context.message.isEdited,
        guildId: context.guildId,
        messageId: context.messageId,
        store: true,
        timestamp: context.message.editedAtUnix || context.message.timestampUnix,
        userId: context.userId,
      });

      if (logChannel) {
        const embed = formatMuck(MuckContextTypes.LOG, {
          content: context.content,
          context,
          muck,
        });
        await logChannel.createMessage({embed});
      }
    }
  } catch(error) {
    console.error(error);
  }
});

muckMan.on('COMMAND_RATELIMIT', async ({command, context, ratelimit, remaining}) => {
  if (!ratelimit.replied) {
    if (context.message.canReply) {
      ratelimit.replied = true;
      setTimeout(() => {
        ratelimit.replied = false;
      }, remaining / 2);

      let noun = 'You';
      if (command.ratelimit) {
        switch (command.ratelimit.type) {
          case 'channel':
          case 'guild': {
            noun = "Y'all";
          }; break;
        }
      }
      try {
        await context.reply(`${noun} are using ${command.name} too fast, wait ${(remaining / 1000).toFixed(1)} seconds.`);
      } catch(e) {
        ratelimit.replied = false;
      }
    }
  }
});

(async () => {
  const cluster = await muckMan.run();
  process.title = `S: ${cluster.shards.map((s: any, id: number) => id).join(',')}`;

  for (let [shardId, shard] of cluster.shards) {
    shard.gateway.on('state', ({state}: {state: string}) => {
      console.log(`Shard #${shardId} - ${state}`);
    });
  }
  console.log(`Shards #(${cluster.shards.map((s: any, id: number) => id).join(', ')}) loaded`);
})();
