const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')


const ProductAttribute = sequelize.define('ProductAttribute', {
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
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscribe_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  normal_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  out_of_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscription_required: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

  tableName: 'tbl_product_attribute', // Match the table name in the database
  timestamps: true,


});

module.exports = ProductAttribute;
