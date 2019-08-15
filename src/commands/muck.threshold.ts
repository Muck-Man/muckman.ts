import { Command, Structures } from 'detritus-client';

import { Parameters } from '../utils';


export default (<Command.CommandOptions> {
  name: 'threshold',
  args: [
    {name: 'set', type: Parameters.percentage},
    {name: 'remove', type: 'bool'},
    {name: 'guild', type: Parameters.guild},
    {name: 'channel', type: Parameters.channel},
  ],
  prefixes: ['m', 'muck'],
  prefixSpace: true,
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  label: 'attribute',
  type: (value) => {
    return value.trim().replace(/ /g, '_').toLowerCase();
  },
  run: async (context, args) => {
    return context.editOrReply('lmao u thought');
  },
  onError: (context, args, error) => {
    console.error(error);
  },
  onRunError: async (context, args, error) => {
    console.error(error);
  },
  onTypeError: (context, error) => {
    console.error(error);
  },
});
