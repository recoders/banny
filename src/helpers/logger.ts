import dotenvLoad from "dotenv-load"
dotenvLoad()

import winston from 'winston'
const { format, transports } = winston

const combinedLogFile = process.env.LOG_COMBINED || "combined.log"
const errorLogFile = process.env.LOG_ERROR || "error.log"

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  // timestamp: function () {
  //   return (new Date()).toLocaleTimeString();
  // },
  // defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: errorLogFile, level: 'error' }),
    new transports.File({ filename: combinedLogFile, level: 'info' })
  ],
  exitOnError: false, // do not exit on handled exceptions
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(format.prettyPrint({ colorize: true, }), format.cli()),
  }))

  winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
  })
}

// extending log method of logger to suppport single argument in log function.
// export function log() {
//     if (arguments.length > 1) {
//         logger.log(...arguments);
//     } else
//         logger.info(arguments[0]);
// }


export default logger
