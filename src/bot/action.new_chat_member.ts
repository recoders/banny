import { I18nContext } from '@edjopato/telegraf-i18n'
import { Context } from 'telegraf'
import { User } from 'telegraf/typings/telegram-types'
import ChatModel from '../db/models/chat.model'

export async function actionNewChatMember(ctx: Context & {
  i18n?: I18nContext,
}): Promise<void> {
  const members = (ctx.message as any).new_chat_members as Array<User>
  const myId = ctx.botInfo.id
  const meExists = members.find((member) => member.id === myId)
  if (meExists) {
    let chat = await ChatModel.getByContext(ctx)
    if (!chat) {
      chat = await ChatModel.createFromContext(ctx)
    } else {
      await chat.update({
        enabled: true
      })
    }
    const text = ctx.i18n.t('new_chat_member', {
      chat: {
        ...chat.get(),
        anchor: chat.anchor,
      }
    })
    await ctx.telegram.sendMessage(ctx.from.id, text, {
      parse_mode: "HTML",
    })
    return
  }
}
