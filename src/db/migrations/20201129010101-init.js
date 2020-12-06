'use strict';

const { DeletedAt } = require("sequelize-typescript");

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.createTable('user', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      telegramId: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      name: Sequelize.DataTypes.STRING,
      username: Sequelize.DataTypes.STRING,
      state: {
        type: Sequelize.DataTypes.TEXT, // Problem with sequlize
        allowNull: false,
        defaultValue: '{}'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
    }, {
      collate: 'utf8_general_ci',
    });
    await queryInterface.createTable('chat', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: Sequelize.DataTypes.STRING,
      username: Sequelize.DataTypes.STRING,
      enabled: Sequelize.DataTypes.BOOLEAN,
      telegramId: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
    }, {
      collate: 'utf8_general_ci',
    });
    await queryInterface.createTable('chat_user', {
      chatId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chat',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      userId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      level: Sequelize.DataTypes.INTEGER(4),
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    }, {
      collate: 'utf8_general_ci',
      indexes: [{
        unique: true,
        fields: ['userId', 'chatId']
      }]
    });
    await queryInterface.createTable('rule', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      chatId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chat',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
      },
      whitelist: Sequelize.DataTypes.TEXT,
      blacklist: Sequelize.DataTypes.TEXT,
      config: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        defaultValue: 0,
      },
      action: {
        type: Sequelize.DataTypes.INTEGER(2),
        allowNull: false,
        defaultValue: 0,
      },
      actionConfig: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        defaultValue: '{}',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    }, {
      collate: 'utf8_general_ci',
      indexes: [{
        unique: true,
        fields: ['chatId', 'word']
      }]
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rule');
    await queryInterface.dropTable('chat_user');
    await queryInterface.dropTable('chat');
    await queryInterface.dropTable('user');
  }
};
