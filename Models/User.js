const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const User = sequelize.define('tbl_user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true, // Assuming auto increment for the id field
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ccode: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  refercode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parentcode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  registartion_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  wallet: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  tableName: 'tbl_user',
  timestamps: true,
});

module.exports = User;
