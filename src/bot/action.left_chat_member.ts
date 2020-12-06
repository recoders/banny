import { I18nContext } from '@edjopato/telegraf-i18n'
import { Context } from 'telegraf'
import { User } from 'telegraf/typings/telegram-types'
import ChatModel from '../db/models/chat.model'

export async function actionLeftChatMembet(ctx: Context & {
  i18n?: I18nContext,
}): Promise<any> {
  const leftMember = (ctx.message as any).left_chat_member as User
  if (leftMember.id === ctx.botInfo.id) {
    const chat = await ChatModel.findOne({
      where: {
        telegramId: ctx.chat.id
      }
    })
    if (!chat) {
      return false
    }
    await chat.update({
      enabled: false
    })
    console.log(chat.get({ plain: true }))
    const text = ctx.i18n.t('left_chat_member', {
      chat: {
        ...chat.get(),
        anchor: chat.anchor,
      }
    })
    return ctx.telegram.sendMessage(ctx.from.id, text, {
      parse_mode: "HTML",
    })
  }
}
