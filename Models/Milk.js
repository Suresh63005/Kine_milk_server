const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Milk = sequelize.define('Milk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  data: {
    type: DataTypes.TEXT('long'), 
    allowNull: false,
  },
}, {
  tableName: 'tbl_milk', 
  timestamps: true, 
});

module.exports = Milk;
