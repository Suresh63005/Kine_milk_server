const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your Sequelize instance

const Address = sequelize.define('Address', {
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
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  landmark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  r_instruction: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  a_type: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  a_lat: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  a_long: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_address',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
});

module.exports = Address;