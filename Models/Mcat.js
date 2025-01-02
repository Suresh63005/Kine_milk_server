const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Mcat = sequelize.define('Mcat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.INTEGER,
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
  img: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_mcat',
  timestamps: false, 
  charset: 'latin1',
  collate: 'latin1_general_ci',
});

module.exports = Mcat;