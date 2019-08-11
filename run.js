const { ClusterManager } = require('detritus-client');

const token = '';
const manager = new ClusterManager('./lib/bot', token, {
  shardsPerCluster: 6,
});

(async () => {
  await manager.run();
  console.log(`running shards ${manager.shardStart} to ${manager.shardEnd} on ${manager.shardCount}`);
})();
