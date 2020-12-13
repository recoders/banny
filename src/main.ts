import dotenvLoad from "dotenv-load"
import { bot } from './bot'
import { sequelize } from './db'
import logger from './helpers/logger'
dotenvLoad()

// TS Models initialization
void sequelize.databaseVersion().then(logger.info)

void bot.launch()
