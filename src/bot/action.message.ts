import { I18nContext } from '@edjopato/telegraf-i18n'
import { Context } from 'telegraf'
import { Message } from 'telegraf/typings/telegram-types'
import ChatModel from '../db/models/chat.model'
import ChatUserModel, { EChatUserLevel } from '../db/models/chat_user.model'
import RuleModel from '../db/models/rule.model'
import UserModel from '../db/models/user.model'
import { EDataType, showRuleInfo } from './action.callback'
import { actionStart } from './action.start'

export async function actionMessage(ctx: Context & {
  i18n?: I18nContext,
}): Promise<any> {
  const user = await UserModel.getByContext(ctx)
  const message = ctx.message as Message.TextMessage
  if (ctx.chat.id === ctx.from.id) {
    if (user.state.configType) {
      const rule = await RuleModel.findByPk(user.state.configId)
      if (rule) {
        switch (user.state.configType) {
          case EDataType.whitelist:
            await rule.update({ whitelist: message.text })
            break
          case EDataType.blacklist:
            await rule.update({ blacklist: message.text })
            break
          default:
            break
        }
      }
      await user.resetConfig()
      await showRuleInfo(ctx, user, rule.id.toString())
    } else {
      await actionStart(ctx)
    }
    return
  } else {
    const chat = await ChatModel.getByContext(ctx)
    const chatUser = await ChatUserModel.findOne({
      where: {
        chatId: chat.id,
        userId: user.id,
      }
    })
    const rule = await chat.getApplicableRule(message)
    if (rule && (!chatUser || chatUser.level < EChatUserLevel.superadmin)) {
      await rule.apply(message)
    }
    return
  }
}
