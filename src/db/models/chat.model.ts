import { AllowNull, AutoIncrement, BelongsToMany, Column, CreatedAt, Default, HasMany, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript'
import { BIGINT, Includeable } from 'sequelize'
import UserModel from './user.model'
import ChatUserModel, { EChatUserLevel } from './chat_user.model'
import { Context } from 'telegraf'
import RuleModel from './rule.model'
import { Message } from 'telegraf/typings/telegram-types'

@Table({
  tableName: 'chat'
})
export default class ChatModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number

  @AllowNull(false)
  @Column(BIGINT)
  telegramId: number

  @AllowNull(false)
  @Column
  title: string

  @Column
  username: string

  @Default(true)
  @Column
  enabled: boolean

  @HasMany(() => ChatUserModel)
  chatUsers: Array<ChatUserModel>

  @BelongsToMany(() => UserModel, () => ChatUserModel)
  users: Array<UserModel>

  @HasMany(() => RuleModel)
  rules: Array<RuleModel>

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  async getApplicableRule(message: Message.TextMessage): Promise<RuleModel> {
    const rules = await RuleModel.findAll({
      where: {
        chatId: this.id
      },
      order: [[ 'id', 'ASC' ]]
    })
    let i = 0
    while (i < rules.length) {
      const rule = rules[i]
      if (rule.isApplicable(message)) {
        return rule
      }
      i++
    }
    return null
  }

  public get link(): string {
    return `tg://chat?id=${this.telegramId}`
  }

  public get anchor(): string {
    const title = this.title || this.username || this.link
    return `<b>${title}</b>`
  }

  static async getByContext(ctx: Context, include?: Array<Includeable>): Promise<ChatModel> {
    return ChatModel.findOne({
      where: {
        telegramId: ctx.chat.id,
      },
      include,
    })
  }

  static async createFromContext(ctx: Context): Promise<ChatModel> {
    const user = await UserModel.getByContext(ctx)
    const chatInfo = ctx.chat as any
    const chat = await ChatModel.create({
      telegramId: ctx.chat.id,
      title: chatInfo.title,
      username: chatInfo.username,
      enabled: true,
    })
    await ChatUserModel.create({
      chatId: chat.id,
      userId: user.id,
      level: EChatUserLevel.superadmin,
    })
    return chat
  }
}
