const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

// if (!process.env.MONGO_URL) {
//     throw new Error("Please add the MONGO_URL environment variable");
//   }

module.exports = function(){
    const db = config.get('db');
    mongoose.connect(db)
        .then(() => winston.info(`connected to ${db}`));
}