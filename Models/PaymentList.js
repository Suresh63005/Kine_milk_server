const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentList = sequelize.define('PaymentList', {
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
  img: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attributes: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  subtitle: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  p_show: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tbl_payment_list', 
  timestamps: false, 
  charset: 'latin1',
});

module.exports = PaymentList;
