const mongoose = require('mongoose');

const { Schema } = mongoose;

const scheduleMessageSchema = new Schema({
  _id: { type: Schema.Types.Oid, auto: true },
  authorId: String,
  scheduleChannelId: String,
  scheduleGuildId: String,
  scheduledDate: Date,
  active: Boolean,
  message: String,
  createdDate: { type: Schema.Types.Date, default: Date.now }
});

module.exports = mongoose.model('scheduleMessage', scheduleMessageSchema);
