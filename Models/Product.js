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
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

  tableName: 'tbl_product', // Match the table name in the database
  timestamps: true,

});

module.exports = Product;