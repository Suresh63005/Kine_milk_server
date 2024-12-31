const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const SubscribeOrderProduct = sequelize.define('SubscribeOrderProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Assuming you want auto-incrementing IDs
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
  startdate: {
    type: DataTypes.DATEONLY, // Use DATEONLY for date without time
    allowNull: false,
  },
  totaldelivery: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totaldates: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  completedates: {
    type: DataTypes.TEXT,
    allowNull: true, // Allow null for optional fields
  },
  selectday: {
    type: DataTypes.TEXT,
    allowNull: true, // Allow null for optional fields
  },
  tslot: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_subscribe_order_product', 
  timestamps: true
});

module.exports = SubscribeOrderProduct;