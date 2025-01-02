const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')


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

  tableName: 'tbl_time', // Match the table name in the database
  timestamps: true


});

module.exports = Time;