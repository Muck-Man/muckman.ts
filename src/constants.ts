import { Constants as SocketConstants } from 'detritus-client-socket';

const {
  GatewayPresenceStatuses: Statuses,
} = SocketConstants;


export const MuckAttributes: {[key: string]: string} = Object.freeze({
  ATTACK_ON_AUTHOR: 'attack_on_author',
  ATTACK_ON_COMMENTER: 'attack_on_commenter',
  FLIRTATION: 'flirtation',
  INCOHERENT: 'incoherent',
  INFLAMMATORY: 'inflammatory',
  IDENTITY_ATTACK: 'identity_attack',
  INSULT: 'insult',
  LIKELY_TO_REJECT: 'likely_to_reject',
  OBSCENE: 'obscene',
  PROFANITY: 'profanity',
  SEVERE_TOXICITY: 'severe_toxicity',
  SEXUALLY_EXPLICIT: 'sexually_explicit',
  SPAM: 'spam',
  THREAT: 'threat',
  TOXICITY: 'toxicity',
  UNSUBSTANTIAL: 'unsubstantial',
});

export const MUCK_ATTRIBUTES = Object.freeze(Object.values(MuckAttributes));

export const MuckAttributeNames: {[key: string]: string}  = Object.freeze({
  [MuckAttributes.ATTACK_ON_AUTHOR]: 'Attack on Author',
  [MuckAttributes.ATTACK_ON_COMMENTER]: 'Attack on Commenter',
  [MuckAttributes.FLIRTATION]: 'Flirtation',
  [MuckAttributes.INCOHERENT]: 'Incoherent',
  [MuckAttributes.INFLAMMATORY]: 'Inflammatory',
  [MuckAttributes.IDENTITY_ATTACK]: 'Identity Attack',
  [MuckAttributes.INSULT]: 'Insult',
  [MuckAttributes.LIKELY_TO_REJECT]: 'Likely to Reject',
  [MuckAttributes.OBSCENE]: 'Obscene',
  [MuckAttributes.PROFANITY]: 'Profanity',
  [MuckAttributes.SEVERE_TOXICITY]: 'Severe Toxicity',
  [MuckAttributes.SEXUALLY_EXPLICIT]: 'Sexually Explicit',
  [MuckAttributes.SPAM]: 'Spam',
  [MuckAttributes.THREAT]: 'Threat',
  [MuckAttributes.TOXICITY]: 'Toxicity',
  [MuckAttributes.UNSUBSTANTIAL]: 'Unsubstantial',
});

export const MuckContextTypes = Object.freeze({
  ANALYZE: 'analyze',
  CHANNEL: 'channel',
  GLOBAL: 'global',
  GUILD: 'guild',
  LOG: 'log',
  LOG_DELETE: 'log-delete',
  USER: 'user',
});

export const MuckStatTypes: {[key: string]: string} = Object.freeze({
  GLOBAL: 'global',
  GUILD: 'guild',
  CHANNEL: 'channel',
});

export const PresenceStatusColors: {[key: string]: number} = Object.freeze({
  [Statuses.ONLINE]: 4437377,
  [Statuses.DND]: 15746887,
  [Statuses.IDLE]: 16426522,
  [Statuses.OFFLINE]: 7634829,
});

export const PresenceStatusTexts: {[key: string]: string} = Object.freeze({
  [Statuses.ONLINE]: 'Online',
  [Statuses.DND]: 'Do Not Disturb',
  [Statuses.IDLE]: 'Idle',
  [Statuses.OFFLINE]: 'Offline',
});
