const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')


const Rnoti = sequelize.define('Rnoti', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  rid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  msg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE, 
    allowNull: false,
  },
}, {

  tableName: 'tbl_rnoti', 
  timestamps: true,


});

module.exports = Rnoti;