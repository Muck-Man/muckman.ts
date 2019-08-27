import {
  Command,
  Structures,
  Utils,
} from 'detritus-client';

import {
  MuckAttributeNames,
  MuckContextTypes,
  MuckStatTypes,
  MUCK_ATTRIBUTES,
} from '../constants';
import GuildMembersChunkStore, { GuildMembersChunk } from '../stores/guildmemberschunk';


export async function findMembers(
  context: Command.Context,
  options: {
    limit?: number,
    presences?: boolean,
    query?: string,
    timeout?: number,
    userIds?: Array<string>,
  } = {},
): Promise<GuildMembersChunk | null> {
  if (!context.guildId) {
    throw new Error('Context must be from a guild');
  }
  const key = `${context.guildId}:${options.query || ''}:${options.userIds && options.userIds.join('.')}`;
  if (GuildMembersChunkStore.has(key)) {
    return <GuildMembersChunk | null> GuildMembersChunkStore.get(key);
  }
  if (!options.timeout) {
    options.timeout = 5000;
  }
  return new Promise((resolve, reject) => {
    let timeout: null | number = null;
    const listener = (event: GuildMembersChunk) => {
      if (event.guildId === context.guildId && event.members) {
        let matches = false;
        if (options.query) {
          matches = event.members.every((member: Structures.Member) => {
            return member.names.some((name) => {
              return name.toLowerCase().startsWith(<string> options.query);
            });
          });
        } else if (options.userIds) {
          matches = options.userIds.every((userId) => {
            if (event.notFound && event.notFound.includes(userId)) {
              return true;
            }
            if (event.members) {
              return event.members.some((member) => member.id === userId);
            }
            return false;
          });
        }
        if (matches) {
          if (timeout !== null) {
            clearTimeout(<any> timeout);
            timeout = null;
          }
          context.client.removeListener('GUILD_MEMBERS_CHUNK', listener);
          GuildMembersChunkStore.insert(key, event);
          resolve(event);
        }
      }
    };
    context.client.on('GUILD_MEMBERS_CHUNK', listener);
    context.client.gateway.requestGuildMembers(<string> context.guildId, {
      limit: options.limit || 50,
      presences: options.presences,
      query: <string> options.query,
      userIds: options.userIds,
    });
    timeout = setTimeout(() => {
      if (timeout !== null) {
        timeout = null;
        context.client.removeListener('GUILD_MEMBERS_CHUNK', listener);
        GuildMembersChunkStore.insert(key, null);
        reject(new Error(`Search took longer than ${options.timeout}ms`));
      }
    }, options.timeout);
  });
}


export interface FindMemberByUsernameCache {
  find: (func: (member: Structures.Member | Structures.User | undefined) => boolean) => Structures.Member | Structures.User | undefined,
}

export function findMemberByUsername(
  members: FindMemberByUsernameCache,
  username: string,
  discriminator?: null | string,
): Structures.Member | Structures.User | undefined {
  return members.find((member) => {
    if (member) {
      const match = member.names.some((name) => {
        return name.toLowerCase().startsWith(username);
      });
      if (match) {
        return (discriminator) ? member.discriminator === discriminator : true;
      }
    }
    return false;
  });
}


export interface FormatMuckOptions {
  content: string,
  context: Command.Context,
  error?: any,
  muck?: {
    analyzed_on: number,
    hash: string,
    scores: {[key: string]: number},
  },
  stats?: {
    count: number,
    scores: {[key: string]: number},
    started: number,
  },
  statsContext?: null | Structures.Channel | Structures.Guild,
  statsType?: string,
  statsUser?: Structures.User,
}

export function formatMuck(is: string, {
  content,
  context,
  error,
  muck,
  stats,
  statsContext,
  statsType,
  statsUser,
}: FormatMuckOptions): any {
  const color = {r: 0, g: 0, b: 0};

  if (muck || stats) {
    const { scores } = <any> (muck || stats);
    const average = (scores.toxicity + scores.obscene) / 2;
    color.r = Math.round(255 * average);
    color.g = Math.round(255 * (1 - average));

    if (color.g < color.r) {
      color.b = 71;
    } else {
      color.b = 129;
    }
  }

  const embed = new Utils.Embed({});
  embed.setAuthor('', null, 'https://muck.gg');
  embed.setColor(Utils.rgbToInt(color.r, color.g, color.b));

  if (context.client.user) {
    embed.setFooter('Muck Man', context.client.user.avatarUrl);
  }

  if (error) {
    embed.setFooter(`Error: ${error.message}`);
  }

  if (muck) {
    for (let key of MUCK_ATTRIBUTES) {
      const name = MuckAttributeNames[key];
      const score = muck.scores[key] || 0;
      const value = `${(score * 100).toFixed(2)}%`;
      embed.addField(name, value, true);
    }
  }

  if (stats) {
    for (let key of MUCK_ATTRIBUTES) {
      const name = MuckAttributeNames[key];
      const score = stats.scores[key] || 0;
      const value = `${(score * 100).toFixed(2)}%`;
      embed.addField(name, value, true);
    }
  }

  switch (is) {
    case MuckContextTypes.ANALYZE: {
      embed.setAuthor(
        `${context.user} (${context.user.id})`,
        context.user.avatarUrl,
      );
      embed.setDescription(content);
      embed.setTitle('Content');
    }; break;
    case MuckContextTypes.CHANNEL: {
      const channel = <Structures.Channel> statsContext;
      embed.setAuthor(`${channel} (${channel.id})`);
      if (stats) {
        embed.setFooter(`Analyzed ${stats.count.toLocaleString()} messages | Started analyzing`);
        embed.setTimestamp(stats.started);
      }
    }; break;
    case MuckContextTypes.GLOBAL: {
      embed.setAuthor(`Global Stats`);
      if (stats) {
        embed.setFooter(`Analyzed ${stats.count.toLocaleString()} messages | Started analyzing`);
        embed.setTimestamp(stats.started);
      }
    }; break;
    case MuckContextTypes.GUILD: {
      const guild = <Structures.Guild> statsContext;
      embed.setAuthor(`${guild} (${guild.id})`, guild.iconUrl);
      if (stats) {
        embed.setFooter(`Analyzed ${stats.count.toLocaleString()} messages | Started analyzing`);
        embed.setTimestamp(stats.started);
      }
    }; break;
    case MuckContextTypes.LOG: {
      embed.setAuthor(`${context.user} (${context.user.id})`, context.user.avatarUrl);
      embed.setTitle('Content');
      embed.setDescription(content);
      if (muck) {
        embed.setFooter(`Channel ${context.channel} (${context.channelId})`);
        embed.setTimestamp(context.message.timestamp);
      }
    }; break;
    case MuckContextTypes.LOG_DELETE: {

    }; break;
    case MuckContextTypes.USER: {
      const description = [`User\'s ${toTitleCase(statsType || '')} Stats`];
      if (statsContext) {
        description.push(`${statsContext} (${statsContext.id})`);
        if (statsType === MuckStatTypes.GUILD) {
          const iconUrl = statsContext.iconUrl;
          if (iconUrl) {
            embed.setThumbnail(iconUrl);
          }
        }
      }
      if (statsUser) {
        embed.setAuthor(`${statsUser} (${statsUser.id})`, statsUser.avatarUrl);
      } else {
        embed.setAuthor('Unknown User');
      }
      embed.setDescription(description.join('\n'));
      if (stats) {
        embed.setFooter(`Analyzed ${stats.count.toLocaleString()} messages | Started analyzing`);
        embed.setTimestamp(stats.started);
      }
    }; break;
  }

  return embed;
}


export interface FormatTimeOptions {
  day?: boolean,
  ms?: boolean,
}

export function formatTime(ms: number, options: FormatTimeOptions = {}): string {
  const showDays = options.day || options.day === undefined;
  const showMs = !!options.ms;

  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  let milliseconds = ms % 1000;

  seconds %= 60;
  minutes %= 60;
  hours %= 24;


  const daysStr = (days) ? `${days}d` : '';
  const hoursStr = (`0${hours}`).slice(-2);
  const minutesStr = (`0${minutes}`).slice(-2);
  const secondsStr = (`0${seconds}`).slice(-2);
  const millisecondsStr = (`00${milliseconds}`).slice(-3);

  let time = `${minutesStr}:${secondsStr}`;
  if (hours) {
    time = `${hoursStr}:${time}`;
  }
  if (showMs) {
    time = `${time}.${millisecondsStr}`;
  }
  if (showDays && days) {
    time = `${daysStr} ${time}`;
  }
  return time;
}

export function isSnowflake(value: string): boolean {
  return Number.MAX_SAFE_INTEGER < parseInt(value);
}

export function toTitleCase(value: string): string {
  return value.replace(/_/g, ' ').split(' ').map((word) => {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  }).join(' ');
}
