const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')



const WalletReport = sequelize.define('WalletReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, 
    allowNull: false,
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  amt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tdate: {
    type: DataTypes.DATE, 
    allowNull: false,
  },
}, {

  tableName: 'wallet_report', // Match the table name in the database
  timestamps: true,


});

module.exports = WalletReport;