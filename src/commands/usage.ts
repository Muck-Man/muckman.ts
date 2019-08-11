import { Command } from 'detritus-client';


export default (<Command.CommandOptions> {
  name: 'usage',
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  run: (context, args) => {
    const information = {
      using: `${Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100} MB`,
      shardCount: context.shardCount,
      applications: context.applications.length,
      channels: context.channels.length,
      emojis: context.emojis.length,
      guilds: context.guilds.length,
      members: context.members.length,
      messages: context.messages.length,
      notes: context.notes.length,
      presences: context.presences.length,
      relationships: context.relationships.length,
      sessions: context.sessions.length,
      typing: context.typing.length,
      users: context.users.length,
      voiceCalls: context.voiceCalls.length,
      voiceConnections: context.voiceConnections.length,
      voiceStates: context.voiceStates.length,
    };
    return context.reply([
      '```json',
      JSON.stringify(information, null, 2),
      '```',
    ].join('\n'));
  },
});
