import { AllowNull, AutoIncrement, Column, CreatedAt, Default, HasMany, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript'
import { BIGINT, JSON } from 'sequelize'
import { Context } from 'telegraf'
import ChatUserModel from './chat_user.model'
import { EDataType } from '../../bot/action.callback'

interface IUserState {
  configType: EDataType,
  configId: number,
}

@Table({
  tableName: 'user'
})
export default class UserModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number

  @AllowNull(false)
  @Column(BIGINT)
  telegramId: number

  @AllowNull(false)
  @Column
  name: string

  @Column
  username: string

  @HasMany(() => ChatUserModel)
  userChats: Array<ChatUserModel>

  @Default({})
  @Column(JSON)
  state: IUserState

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  async updateConfig(configType: EDataType, configId: number): Promise<this> {
    return this.update({
      state: {
        ...this.state,
        configType,
        configId,
      }
    })
  }

  async resetConfig(): Promise<this> {
    return this.update({
      state: {
        ...this.state,
        configType: null,
        configId: null,
      }
    })
  }

  static async getByContext(ctx: Context): Promise<UserModel> {
    let user = await UserModel.findOne({
      where: {
        telegramId: ctx.from.id,
      }
    })
    if (!user) {
      const username = ctx.from.username
      let name = ctx.from.first_name
      if (ctx.from.last_name) {
        name += ' ' + ctx.from.last_name
      }
      user = await UserModel.create({
        telegramId: ctx.from.id,
        name,
        username,
      })
    }
    return user
  }
}
