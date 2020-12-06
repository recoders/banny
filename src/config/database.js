require('dotenv-load')();

module.exports = {
  "development": {
    "url": process.env.DATABASE_URL,
    "dialect": process.env.DB_DIALECT || "mariadb",
    dialectOptions: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
    "seederStorage": "sequelize",
  },
  "test": {
    "url": process.env.DATABASE_URL,
    "dialect": process.env.DB_DIALECT || "mariadb",
    dialectOptions: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
    "seederStorage": "sequelize",
  },
  "production": {
    "url": process.env.DATABASE_URL,
    "dialect": process.env.DB_DIALECT || "mariadb",
    dialectOptions: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
    "seederStorage": "sequelize",
  }
}
