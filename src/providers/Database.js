const Mongoose = require('mongoose');
const { mongo: mongoConfig } = require('config');
const Logger = require('../utils/Logger');

const options = {
  useNewUrlParser: true
};

const connectionString = `mongodb://${mongoConfig.url}:${mongoConfig.port}/${mongoConfig.database}`;
Mongoose.connect(connectionString, options);
const db = Mongoose.connection;
db.on('error', Logger.error.bind(Logger, 'connection error'));
db.once('open', () => {
  Logger.info(`Connection to MongoDB : ${connectionString}`);
});

module.exports = db;
