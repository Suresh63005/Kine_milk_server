const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const Coupon = sequelize.define('Coupon', {
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
  coupon_img: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  coupon_code: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expire_date: {
    type: DataTypes.DATEONLY, // Use DATEONLY for date without time
    allowNull: false,
  },
  min_amt: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  coupon_val: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Default value for status
  },
}, {
  tableName: 'tbl_coupon',
  timestamps: true,
  
});

module.exports = Coupon;