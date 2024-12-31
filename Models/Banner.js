const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  img: {
    type: DataTypes.TEXT('long'), 
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'banner', 
  timestamps: false, 
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

module.exports = Banner;
