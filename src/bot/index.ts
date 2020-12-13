import { session, Telegraf } from "telegraf"
import logger from '../helpers/logger'
import RedisSession from 'telegraf-session-redis'
import { actionStart } from './action.start'
import updateLogger from 'telegraf-update-logger'
import rateLimit from 'telegraf-ratelimit'
import AnyCase from 'telegraf-anycase-commands'
import { actionNewChatMember } from './action.new_chat_member'
import { actionLeftChatMembet } from './action.left_chat_member'
import { actionMessage } from './action.message'
import { actionChats } from './action.chats'
import { actionCallback } from './action.callback'
import { i18n } from './i18n'

// Init
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// Localization
bot.use(i18n.middleware())

// Configure
if (process.env.REDIS_SESSION_HOST && process.env.REDIS_SESSION_PORT) {
  logger.info('Session store is: Redis')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const redisSession = new RedisSession({
    store: {
      host: process.env.REDIS_SESSION_HOST,
      port: process.env.REDIS_SESSION_PORT
    }
  })
  bot.use(redisSession.middleware())
} else {
  /* Otherwise use default memory session, not recommended for production */
  logger.info('Session store is: memory')
  bot.use(session())
}

const limitConfig = {
  window: parseInt(process.env.SPAM_TIMEOUT) || 300,
  limit: parseInt(process.env.SPAM_COUNT) || 50,
  // onLimitExceeded: (ctx: Context): Promise<any> => ctx.reply(i18n.t('en', 'index.spam.warning'))
  onLimitExceeded: (): void => { }
}

bot.use(updateLogger({ colors: true }))
bot.use(rateLimit(limitConfig))
bot.use(AnyCase.lowercase())

// Actions
bot.start(actionStart)

bot.on("new_chat_members", actionNewChatMember)
bot.on("left_chat_member", actionLeftChatMembet)

bot.command("chats", actionChats)
bot.on('callback_query', actionCallback)

bot.on(["message", "edited_message"], actionMessage)

// Errors
bot.catch((err, ctx) => {
  logger.warn(err.toString())
  console.log(err)
  // throw err
})

// Export
const telegram = bot.telegram
export {
  bot,
  telegram,
}
