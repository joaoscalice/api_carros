const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const Car = sequelize.define('Car', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  marca: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ano: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  modelo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'Users', 
      key: 'id'
    }
  }
});

User.hasMany(Car, { foreignKey: 'userId' });
Car.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Car
};