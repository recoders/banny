import dotenvLoad from 'dotenv-load'
dotenvLoad()

/** Typescript Database initializaton */
import { sequelize } from './db/index'
import logger from './helpers/logger'

const scheduleSeconds = 600

// eslint-disable-next-line @typescript-eslint/require-await
async function doScheduledTasks(): Promise<void> {
  logger.info(`Sheduled tasks running`)
}

void sequelize.databaseVersion().then(async () => {
  await doScheduledTasks()
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(doScheduledTasks, scheduleSeconds * 1000)
})
