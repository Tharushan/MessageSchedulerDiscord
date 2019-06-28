const Discord = require('discord.js');
const config = require('config');
const _ = require('lodash');
const schedule = require('node-schedule');
const moment = require('moment');
const chrono = require('chrono-node');

const logger = require('./src/utils/Logger');
const Database = require('./src/providers/Database'); // eslint-disable-line
const ScheduleMessageSchema = require('./src/models/scheduleMessage');

const schedulers = []; // List of users scheduling messages
const bot = new Discord.Client({ autoReconnect: true, max_message_cache: 0 });

const getResponseMessage = async message => {
  const collected = await message.channel.awaitMessages(
    response => {
      return message.author.id === response.author.id;
    },
    {
      max: 1,
      time: 20000,
      errors: ['time']
    }
  );
  const responseMessage = collected.first();
  if (
    _.includes(['quit', 'exit', 'cancel'], _.toLower(responseMessage.content))
  ) {
    throw new Error('Message scheduling canceled.');
  }
  return responseMessage;
};

bot.login(config.discord.token);

bot.on('ready', async () => {
  logger.info('Starting scheduler bot...');
});

bot.on('message', async message => {
  if (0 !== message.content.indexOf(config.discord.prefix)) {
    return;
  }

  const prefixLength = _.size(config.discord.prefix);
  const args = _.split(message.content, ' ');
  const command = _.toLower(args.shift().substr(prefixLength));

  if (!_.includes(['schedule'], command)) {
    return;
  }

  if (_.includes(schedulers, message.author.id)) {
    // Already in scheduling process
    return;
  }

  schedulers.push(message.author.id);
  await message.channel.send(
    'Which channel do you want the message to be scheduled in ?'
  );

  try {
    const channelMessage = await getResponseMessage(message);
    const [broadcastChannel] = bot.channels
      .filter(
        chan => 'text' === chan.type && channelMessage.content === chan.id
      )
      .array();
    if (_.isEmpty(broadcastChannel) || !broadcastChannel.guild) {
      throw new Error('Cannot find channel.');
    }

    const member = broadcastChannel.guild.member(message.author);
    if (!member) {
      throw new Error('You are not on this discord guild.');
    }

    if (!member.permissions.has('ADMINISTRATOR')) {
      throw new Error('You cannot schedule a message for this channel.');
    }
    message.channel.send(
      `Broadcast channel : \`${broadcastChannel.guild} - ${broadcastChannel.name}\`\nWhen do you want the message to be scheduled on ?`
    );

    const scheduleDate = await getResponseMessage(message);
    const chronoDate = chrono.parseDate(scheduleDate.content);
    const formatedDate = moment(chronoDate);
    if (!formatedDate.isValid()) {
      throw new Error('Invalid date');
    }

    if (moment().isAfter(formatedDate)) {
      throw new Error(
        `Date in the past. (${formatedDate.format('YYYY-MM-DD HH:mm')})`
      );
    }

    if (formatedDate.isAfter(moment().add(2, 'months'))) {
      throw new Error(
        `Schedule date must be lower than 2 months. (${formatedDate.format(
          'YYYY-MM-DD HH:mm'
        )})`
      );
    }

    await message.channel.send(
      `Message scheduled on \`${formatedDate.format(
        'YYYY-MM-DD HH:mm'
      )}\`\nWhat is the content of the message to be scheduled ?`
    );
    const scheduleMessage = await getResponseMessage(message);
    const scheduleM = await ScheduleMessageSchema.create({
      authorId: message.author.id,
      scheduleChannelId: broadcastChannel.id,
      scheduleGuildId: broadcastChannel.guild.id,
      scheduledDate: formatedDate.format('YYYY-MM-DD HH:mm'),
      active: true,
      message: scheduleMessage.content
    });

    schedule.scheduleJob(
      scheduleM._id.toString(),
      formatedDate.format('YYYY-MM-DD HH:mm'),
      async () => {
        broadcastChannel.send(scheduleMessage.content);
        scheduleM.active = false;
        await scheduleM.save();
      }
    );
    logger.info(
      `Scheduled ${scheduleMessage.content} by ${message.author.tag} in ${
        broadcastChannel.name
      } (${broadcastChannel.guild.name}) on ${formatedDate.format(
        'YYYY-MM-DD HH:mm'
      )}`
    );

    await message.channel.send(
      `\`\`\`${scheduleMessage.content}\`\`\`\n will be sent in \`${
        broadcastChannel.name
      } (${broadcastChannel.guild})\` channel on \`${formatedDate.format(
        'YYYY-MM-DD HH:mm'
      )}\``
    );
  } catch (err) {
    logger.error(err);
    message.channel.send(`Error: ${err.message}`);
  }
  _.pull(schedulers, message.author.id);
  return;
});

bot.on('disconnect', e => {
  logger.error(`DISCONNECT:  ${e} (${e.code})`);
});

bot.on('error', e => {
  logger.error(`ERROR: ${e}`);
});
