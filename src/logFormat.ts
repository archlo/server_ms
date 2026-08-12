import * as winston from 'winston';

export const customFormat = winston.format.printf(({level, message, label}) => {
    return `[${label}] ${level}: ${message}`;
});
