const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, 
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_page',
  timestamps: false, 
  charset: 'latin1',
  collate: 'latin1_general_ci',
});

module.exports = Page;