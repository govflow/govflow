import winston from 'winston';

const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({ level: 'error' }),
    ]
});

if (process.env.NODE_ENV !== 'production') {
    const logFiles = new winston.transports.File({ filename: 'combined.log', level: 'debug' });
    logger.add(logFiles);
}

export default logger;
