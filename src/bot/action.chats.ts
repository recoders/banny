import { I18nContext } from '@edjopato/telegraf-i18n'
import { Context } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'
import ChatModel from '../db/models/chat.model'
import ChatUserModel from '../db/models/chat_user.model'
import UserModel from '../db/models/user.model'
import { EDataType } from './action.callback'

export async function actionChats(ctx: Context & {
  i18n?: I18nContext,
}): Promise<void> {
  if (ctx.from.id !== ctx.chat.id) {
    return
  }
  const user = await UserModel.getByContext(ctx)
  const chats = await ChatModel.findAll({
    include: [{
      model: ChatUserModel,
      where: {
        userId: user.id,
      }
    }]
  })
  const buttons: Array<Array<InlineKeyboardButton>> = [[]]
  for (const chat of chats) {
    buttons.push([{
      text: chat.title,
      callback_data: `${EDataType.chat}:${chat.id}`
    }],)
  }
  await ctx.reply(ctx.i18n.t('chat.all'), {
    reply_markup: {
      inline_keyboard: buttons,
    }
  })
}
