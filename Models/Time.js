const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Time = sequelize.define('Time', {
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
  mintime: {
    type: DataTypes.TIME, 
    allowNull: false,
  },
  maxtime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tbl_time', 
  timestamps: false, 
  charset: 'latin1',
  collate: 'latin1_general_ci',
});

module.exports = Time;