const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const NormalOrderProduct = sequelize.define('NormalOrderProduct', {
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
}, {
  tableName: 'tbl_normal_order_product', // Match the table name in the database
  timestamps: false, // Disable timestamps if not present in your table
  charset: 'latin1',
  collate: 'latin1_general_ci',
});

module.exports = NormalOrderProduct;