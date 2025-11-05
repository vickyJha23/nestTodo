import * as winston from "winston";

export const winstonConfig = {
      transports: [
          new winston.transports.Console({
              level: process.env.NODE_ENV === 'production' ? 'warn': 'debug',
              format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
              )
          }),
         new winston.transports.File({
              dirname: "logs",
              filename: "info-log",
              level: 'info'
         }),         
         new winston.transports.File({
              dirname: "logs/error",
              filename: 'error-log',
              level: 'error'
         })

      ]  
}


