const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  img: {
    type: DataTypes.TEXT('long'), // TEXT type for long text values
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'banner', // Match the table name in the database
  timestamps: true, // Disable timestamps if not present in your table
  
});

module.exports = Banner;
