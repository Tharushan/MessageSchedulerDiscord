# Message Scheduler Discord

Project created for the discord hack week 2019

## What is Message Scheduler Discord ?

As the name says, it's a discord bot that provides administrators possibility to schedule message on a later date.

Note: You can also schedule date using sentences like `In 30 minutes` when the bot ask when you want the message to be scheduled instead of a date like `2019-06-29 12:00:00`

## Commands 
```
?schedule: Start message scheduling

?schedule list: List all scheduled messages

?schedule delete: [scheduleId]: Delete a scheduled message (with the id returned with !schedule list

?schedule help: print this help
```

### Major dependencies 
[discord.js](https://github.com/discordjs/discord.js) discord.js is a powerful Node.js module that allows you to easily interact with the Discord API.

[chrono-node](https://github.com/wanasit/chrono) A natural language date parser in Javascript, designed for extracting date information from any given text.

[node-schedule](https://github.com/node-schedule/node-schedule) Node Schedule is a flexible cron-like and not-cron-like job scheduler for Node.js
