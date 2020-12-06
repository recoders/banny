import { Context } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'

export async function editMessageTextSafe(ctx: Context, text: string, buttons: Array<Array<InlineKeyboardButton>>): Promise<void> {
  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: buttons,
      }
    })
  } else {
    await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: buttons,
      }
    })
  }
}
