const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const Cash = sequelize.define('Cash', {
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
  amt: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'tbl_cash',
  timestamps: true,
});

module.exports = Cash;