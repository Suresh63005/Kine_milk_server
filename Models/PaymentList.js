const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

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
  tableName: 'tbl_payment_list', // Match the table name in the database
  timestamps: false, // Disable timestamps since they're not in the table schema
  charset: 'latin1', // Match the charset specified in the table definition
});

module.exports = PaymentList;
