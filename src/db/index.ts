import path from 'path'
import { Sequelize } from 'sequelize-typescript'
import logger from '../helpers/logger'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  // models: [__dirname + '/models/*.model.ts'],
  logging: process.env.LOG_SQL === 'true',
  modelPaths: [ path.resolve(__dirname, 'models', '*.model.ts') ],
})

sequelize
  .authenticate()
  .then(() => {
    logger.info('Sequelize-Typescript: connection has been established successfully.')
  })
  .catch((err) => {
    logger.info('Sequelize-Typescript: unable to connect to the database:', err)
  })

export { sequelize }
