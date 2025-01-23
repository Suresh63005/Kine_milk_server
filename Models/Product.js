const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const Product = sequelize.define('Product', {
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
  cat_id: {
    type: DataTypes.INTEGER,
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
  discount: {
    type: DataTypes.FLOAT,
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
  out_of_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscription_required: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ext_img: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

  tableName: 'tbl_product',
  timestamps: true,

});

module.exports = Product;