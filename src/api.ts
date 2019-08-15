import { Command } from 'detritus-client';
import { RequestTypes } from 'detritus-client-rest';
import {
  Constants as RestConstants,
  Response,
} from 'detritus-rest';


export const TEMP_TOKEN = '';
export const API_URL = 'https://muck.gg/api';

export interface ApiRequestOptions extends RequestTypes.RequestOptions {
  userId?: string,
}


export async function request(
  context: Command.Context,
  options: ApiRequestOptions,
): Promise<any> {
  options.url = API_URL;
  options.headers = Object.assign({}, options.headers);
  options.headers.authorization = TEMP_TOKEN;
  if (options.userId) {
    options.headers['x-user'] = options.userId;
  }
  return context.rest.request(options);
}


export interface AnalyzeMuck {
  channelId?: string,
  content: string,
  edited?: boolean,
  guildId?: null | string,
  messageId?: string,
  timestamp?: number,
  store?: boolean,
  userId?: string,
}

export async function analyzeMuck(
  context: Command.Context,
  options: AnalyzeMuck,
): Promise<any> {
  const body = {
    content: options.content,
    channel_id: options.channelId,
    edited: options.edited,
    guild_id: options.guildId,
    message_id: options.messageId,
    timestamp: options.timestamp,
    store: options.store,
    user_id: options.userId,
  };
  return request(context, {
    body,
    route: {
      method: RestConstants.HTTPMethods.POST,
      path: '/muck', 
    },
  });
}


export async function fetchStatsGlobal(
  context: Command.Context,
): Promise<any> {
  return request(context, {
    route: {
      path: '/muck/stats',
    },
  });
}


export async function fetchStatsChannel(
  context: Command.Context,
  channelId: string,
): Promise<any> {
  return request(context, {
    route: {
      path: '/muck/stats/channels/:channelId:',
      params: {channelId},
    },
  });
}


export async function fetchStatsGuild(
  context: Command.Context,
  guildId: string,
): Promise<any> {
  return request(context, {
    route: {
      path: '/muck/stats/guilds/:guildId:',
      params: {guildId},
    },
  });
}


export interface FetchStatsUser {
  contextId?: string,
  contextType?: string,
}

export async function fetchStatsUser(
  context: Command.Context,
  userId: string,
  options: FetchStatsUser = {},
): Promise<any> {
  return request(context, {
    query: {
      context_id: options.contextId,
      context_type: options.contextType,
    },
    route: {
      path: '/muck/stats/users/:userId:',
      params: {userId},
    },
  });
}
