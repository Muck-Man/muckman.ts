import { Command } from 'detritus-client';


export default (<Command.CommandOptions> {
  name: 'help',
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  run: (context) => {
    return context.editOrReply('**Muck Man** <https://muck.gg>');
  },
});
