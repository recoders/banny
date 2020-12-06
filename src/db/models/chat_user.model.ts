import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript"
import { INTEGER } from 'sequelize'
import ChatModel from './chat.model'
import UserModel from './user.model'
import { Context } from 'telegraf'

export enum EChatUserLevel {
  nobody = 0,
  member = 10,
  admin = 40,
  superadmin = 100,
}

@Table({
  tableName: 'chat_user'
})
export default class ChatUserModel extends Model {
  @ForeignKey(() => ChatModel)
  @Column
  chatId: number

  @BelongsTo(() => ChatModel)
  chat: ChatModel

  @ForeignKey(() => UserModel)
  @Column
  userId: number

  @BelongsTo(() => UserModel)
  user: UserModel

  @Column(INTEGER({ length: 4 }))
  level: EChatUserLevel

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  static async getLevelByContext(ctx: Context): Promise<EChatUserLevel> {
    const user = await UserModel.getByContext(ctx)
    const chat = await ChatModel.getByContext(ctx)
    if (!user || !chat) {
      return EChatUserLevel.nobody
    }
    const chatUser = await ChatUserModel.findOne({
      where: {
        chatId: chat.id,
        userId: user.id,
      }
    })
    if (!chatUser) {
      return EChatUserLevel.nobody
    }
    return chatUser.level
  }
}
