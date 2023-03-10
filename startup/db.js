const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

if (!process.env.MONGO_URL) {
    throw new Error("Please add the MONGO_URL environment variable");
  }

module.exports = function(){
    const db = config.get('MONGO_URL');
    mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
        .then(() => winston.info(`connected to ${db}`));
}