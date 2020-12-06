import { I18nContext } from '@edjopato/telegraf-i18n'
import { Context } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'
import ChatModel from '../db/models/chat.model'
import RuleModel, { EActionType } from '../db/models/rule.model'
import UserModel from '../db/models/user.model'
import logger from '../logger'
import { editMessageTextSafe } from './helpers'

export async function actionCallback(ctx: Context & {
  i18n?: I18nContext,
}): Promise<void> {
  if (ctx.from.id !== ctx.chat.id) {
    return
  }
  const user = await UserModel.getByContext(ctx)
  const callbackQuery = ctx.callbackQuery
  const {
    type,
    value,
  } = getDataTypeValue((callbackQuery as any).data)

  logger.debug(`TYPE: ${type}, VALUE: ${value}`)

  switch (type) {
    case EDataType.chat:
      await showChatInfo(ctx, user, value)
      break
    case EDataType.rule:
      await showRuleInfo(ctx, user, value)
      break
    case EDataType.rule_delete:
      await deleteChatRule(ctx, user, value)
      break
    case EDataType.action:
      await showRuleActions(ctx, user, value)
      break
    case EDataType.set_action:
      await setChatRule(ctx, user, value)
      break
    case EDataType.rule_links:
      await showRuleLinks(ctx, user, value)
      break
    case EDataType.set_rule_links:
      await setRuleLinks(ctx, user, value)
      break
    case EDataType.whitelist:
      await setWhitelist(ctx, user, value) 
      break
    case EDataType.blacklist:
      await setBlacklist(ctx, user, value) 
      break
  }
  await ctx.answerCbQuery()
}

export enum EDataType {
  chat = 'chat',
  rule = 'rule',
  rule_delete = 'rule_delete',
  action = 'action',
  whitelist = 'whitelist',
  blacklist = 'blacklist',
  set_action = 'set_action',
  rule_links = 'rule_links',
  set_rule_links = 'set_rule_links',
}

function getDataTypeValue(data: string): {
  type: EDataType,
  value: string,
} {
  const splitted = data.split(':')
  return {
    type: EDataType[splitted[0]],
    value: splitted[1],
  }
}

async function showChatInfo(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, chatId: string): Promise<void> {
  const chat = await ChatModel.findByPk(chatId, {
    include: [ RuleModel ]
  })
  const buttons: Array<Array<InlineKeyboardButton>> = [[]]
  for (const rule of chat.rules) {
    buttons.push([{
      text: rule.title,
      callback_data: `${EDataType.rule}:${rule.id}`
    }])
  }
  buttons.push([{
    text: ctx.i18n.t(`${EDataType.rule}.new`),
    callback_data: `${EDataType.rule}:-${chat.id}`,
  }])
  const text = ctx.i18n.t(`${EDataType.chat}.title`)
  await editMessageTextSafe(ctx, text, buttons)
}

async function showRuleInfo(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, data: string): Promise<void> {
  const ruleId = parseInt(data)
  let rule: RuleModel
  if (ruleId < 0) {
    rule = await RuleModel.create({
      chatId: -ruleId,
    })
  } else {
    rule = await RuleModel.findByPk(ruleId)
  }
  const buttons: Array<Array<InlineKeyboardButton>> = [[]]
  buttons.push([{
    text: ctx.i18n.t(`${EDataType.action}.button`),
    callback_data: `${EDataType.action}:${rule.id}`,
  }, {
    text: ctx.i18n.t(`${EDataType.rule_links}.button`),
    callback_data: `${EDataType.rule_links}:${rule.id}`,
  }])
  buttons.push([{
    text: ctx.i18n.t(`${EDataType.whitelist}.button`),
    callback_data: `${EDataType.whitelist}:${rule.id}`,
  }, {
    text: ctx.i18n.t(`${EDataType.blacklist}.button`),
    callback_data: `${EDataType.blacklist}:${rule.id}`,
  }])
  buttons.push([{
    text: ctx.i18n.t(`${EDataType.rule}.delete`),
    callback_data: `${EDataType.rule_delete}:${rule.id}`,
  }, {
    text: ctx.i18n.t(`${EDataType.rule}.back`),
    callback_data: `${EDataType.chat}:${rule.chatId}`,
  }])
  const text = ctx.i18n.t(`${EDataType.rule}.title`, {
    ruleInfo: rule.ruleInfo,
  })
  await editMessageTextSafe(ctx, text, buttons)
}

async function deleteChatRule(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, ruleId: string): Promise<void> {
  const rule = await RuleModel.findByPk(ruleId)
  const chatId = rule.chatId
  await rule.destroy()
  await showChatInfo(ctx, user, chatId.toString())
}

async function showRuleActions(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, ruleId: string): Promise<void> {
  const rule = await RuleModel.findByPk(ruleId)
  const buttons: Array<Array<InlineKeyboardButton>> = [[]]
  for (const action of [EActionType.nothing, EActionType.deleteMessage]) {
    buttons.push([{
      text: ctx.i18n.t(`${EDataType.action}.title_${action}`),
      callback_data: `${EDataType.set_action}:${rule.id}_${action}`,
    }])
  }
  const text = ctx.i18n.t(`${EDataType.action}.title`)
  await editMessageTextSafe(ctx, text, buttons)
}

async function setChatRule(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, data: string): Promise<void> {
  const  [ruleId, actionId] = data.split('_')
  await RuleModel.update(
    { action: actionId, },
    { where: { id: ruleId } },
  )
  await showRuleInfo(ctx, user, ruleId)
}

async function showRuleLinks(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, ruleId: string): Promise<void> {
  const rule = await RuleModel.findByPk(ruleId)
  const buttons: Array<Array<InlineKeyboardButton>> = [[]]
  for (const enabled of [0, 1]) {
    buttons.push([{
      text: ctx.i18n.t(`${EDataType.rule_links}.title_${enabled}`),
      callback_data: `${EDataType.set_rule_links}:${rule.id}_${enabled}`,
    }])
  }
  const text = ctx.i18n.t(`${EDataType.rule_links}.title`)
  await editMessageTextSafe(ctx, text, buttons)
}

async function setRuleLinks(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, data: string): Promise<void> {
  const [ruleId, enabled] = data.split('_')
  const allowLinks = enabled === '1'
  const rule = await RuleModel.findByPk(ruleId)
  await rule.updateConfig({
    allowLinks,
  })
  await showRuleInfo(ctx, user, ruleId)
}

async function setWhitelist(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, data: string): Promise<void> {
  const ruleId = parseInt(data)
  await user.updateConfig(EDataType.whitelist, ruleId)
  await ctx.reply(ctx.i18n.t(`${EDataType.whitelist}.title`))
}

async function setBlacklist(ctx: Context & {
  i18n?: I18nContext,
}, user: UserModel, data: string): Promise<void> {
  const ruleId = parseInt(data)
  await user.updateConfig(EDataType.blacklist, ruleId)
  await ctx.reply(ctx.i18n.t(`${EDataType.blacklist}.title`))
}

export {
  showRuleInfo,
}
