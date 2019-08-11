import { Command } from 'detritus-client';


export default (<Command.CommandOptions> {
  name: 'invite',
  ratelimit: {
    duration: 5000,
    limit: 5,
    type: 'guild',
  },
  run: (context) => {
    return context.reply('<https://muck.gg/invite>');
  },
});
