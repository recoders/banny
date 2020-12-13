import { AllowNull, AutoIncrement, BelongsTo, Column, CreatedAt, Default, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript"
import { INTEGER, JSON, TEXT } from 'sequelize'
import ChatModel from './chat.model'
import { i18n } from '../../bot/i18n'
import { Message } from 'telegraf/typings/telegram-types'
import { telegram } from '../../bot'

export enum EActionType {
  nothing = 0,
  deleteMessage = 10,
  ban = 50,
}

export interface IRuleConfig {
  allowLinks: boolean,
}

export interface IActionConfig {
  timeout: number,
}

@Table({
  tableName: 'rule'
})
export default class RuleModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number

  @ForeignKey(() => ChatModel)
  @Column
  chatId: number

  @BelongsTo(() => ChatModel)
  chat: ChatModel

  @AllowNull(false)
  @Default({})
  @Column(JSON)
  config: Partial<IRuleConfig>

  @AllowNull(false)
  @Default(EActionType.nothing)
  @Column(INTEGER({ length: 2 }))
  action: EActionType

  @Default('')
  @Column(TEXT)
  whitelist: string

  @Default('')
  @Column(TEXT)
  blacklist: string

  @AllowNull(true)
  @Default({})
  @Column(JSON)
  actionConfig?: Partial<IActionConfig>

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  get title(): string {
    return `Rule #${this.id}`
  }

  get ruleInfo(): string {
    const text: Array<string> = []
    text.push(`Name: ${this.title}`)
    text.push(`Allow links: ` + i18n.t('', `rule_links.title_${this.config.allowLinks}`))
    text.push(`Whitelist:\n<code>${this.whitelist}</code>`)
    text.push(`Blacklist:\n<code>${this.blacklist}</code>`)
    const actionText = i18n.t('', `action.title_${this.action}`)
    text.push(`Action: ${actionText}`)
    return text.join('\n\n')
  }

  async updateConfig(config: Partial<IRuleConfig>): Promise<this> {
    return this.update({
      config: {
        ...this.config,
        ...config,
      }
    })
  }

  private static findInList(text: string, list: string): boolean {
    text = text.toLowerCase()
    const listItems = list.toLowerCase().split('\n')
    return listItems.findIndex((item) => text.indexOf(item) >= 0) >= 0
  }

  isApplicable(message: Message.TextMessage): boolean {
    if (!this.config.allowLinks) {
      if (message.entities) {
        for (const entity of message.entities) {
          if (entity.type === "url") {
            const text = message.text.substring(entity.offset, entity.offset + entity.length)
            const whitelisted = RuleModel.findInList(text, this.whitelist)
            if (!whitelisted) {
              return true
            }
          }
        }
      }
    }
    if (this.whitelist) {
      const whitelisted = RuleModel.findInList(message.text, this.whitelist)
      if (whitelisted) {
        return false
      }
    }
    if (this.blacklist) {
      const blacklisted = RuleModel.findInList(message.text, this.blacklist)
      if (blacklisted) {
        return true
      }
    }
    return false
  }

  async apply(message: Message.TextMessage): Promise<void> {
    switch (this.action) {
      case EActionType.deleteMessage:
        await telegram.deleteMessage(message.chat.id, message.message_id)
        break
      case EActionType.ban:
        break
      default:
        break
    }
    return 
  }
}
