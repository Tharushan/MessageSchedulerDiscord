const Discord = require('discord.js');
const config = require('config');
const _ = require('lodash');

const logger = require('./src/utils/Logger');
const Database = require('./src/providers/Database'); // eslint-disable-line

const bot = new Discord.Client({ autoReconnect: true, max_message_cache: 0 });

bot.login(config.discord.token);

bot.on('ready', async () => {
  logger.info('Starting scheduler bot...');
});

bot.on('message', async message => {
  if (0 !== message.content.indexOf(config.prefix)) {
    return;
  }

  const prefixLength = _.size(config.prefix);
  const args = _.split(message.content, ' ');
  const command = _.toLower(args.shift().substr(prefixLength));

  if (!_.includes(['schedule'], command)) {
    return;
  }
});

bot.on('disconnect', e => {
  logger.error(`DISCONNECT:  ${e} (${e.code})`);
});

bot.on('error', e => {
  logger.error(`ERROR: ${e}`);
});
