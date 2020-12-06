import { I18nContext } from '@edjopato/telegraf-i18n'
import { Context } from 'telegraf'
import UserModel from '../db/models/user.model'

export async function actionStart(ctx: Context & {
  i18n?: I18nContext,
}): Promise<any> {
  if (ctx.chat.id === ctx.from.id) {
    await UserModel.getByContext(ctx)
    return ctx.reply(ctx.i18n.t('start.welcome'))
  } else {
    console.log('asdasdsad')
    return ctx.deleteMessage()
  }
}
