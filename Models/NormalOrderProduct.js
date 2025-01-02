const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')


const NormalOrderProduct = sequelize.define('NormalOrderProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, 
    allowNull: false,
  },
  oid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pquantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ptitle: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pdiscount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pimg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pprice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ptype: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {

  tableName: 'tbl_normal_order_product', // Match the table name in the database
  timestamps: true,

});

module.exports = NormalOrderProduct;