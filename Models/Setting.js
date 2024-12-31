const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  webname: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  weblogo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timezone: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pstore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  one_key: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  one_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  d_key: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  d_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  s_key: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  s_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  scredit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rcredit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  show_dark: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gkey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_setting',
  timestamps: false,
  charset: 'latin1',
});

module.exports = Setting;
