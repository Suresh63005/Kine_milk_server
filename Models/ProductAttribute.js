const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

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
  timestamps: false, // Disable timestamps since they're not in the table schema
  charset: 'latin1', // Match the charset specified in the table definition
});

module.exports = ProductAttribute;
