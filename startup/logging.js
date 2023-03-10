require('winston-mongoDB');
const winston = require('winston');
const { format } = winston;
const { combine } = format;
require('express-async-errors');

module.exports = function(){
    winston.configure({
        format: combine(
            format.errors({ stack: true }),
            format.metadata() 
          ),
    
        transports: [
            new winston.transports.Console({ 
                colorize: true,
                prettyPrint: true,
                format: winston.format.simple(),
                handleRejections: true,
                handleExceptions: true 
            }),
            
            new winston.transports.File({ 
                    filename: 'logfile.log',
                    handleRejections: true,
                    handleExceptions: true 
            }),

        
            new winston.transports.MongoDB({ 
                db: "mongodb://127.0.0.1:27017/vidly" ,
                options: {
                    useUnifiedTopology: true,
                },
                level: "error"
            })
        ]
    })
    // winston.exceptions.handle(
    //     new winston.transports.File({ filename: 'exceptions.log' })
    //   );
    
    // winston.rejections.handle(
    // new winston.transports.File({ filename: 'rejections.log' })
    // );
    // winston.add(new winston.transports.File({
    //     filename: 'combined.log',
    //     handleRejections: true
    //   }));
    
    // process.on('uncaughtException', (ex) => {
    //     winston.log('error', ex);
    //     process.exit(1);
    // });
    
    // process.on('unhandledRejection', (ex) => {
    //     winston.log('error', ex);
    //     process.exit(1);
    // });

}
