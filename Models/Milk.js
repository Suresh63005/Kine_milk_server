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
    type: DataTypes.LONGTEXT, 
    allowNull: false,
  },
}, {
  tableName: 'tbl_milk', 
  timestamps: false, 
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
});

module.exports = Milk;