const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role:{
    type: DataTypes.ENUM('admin', 'store'),
    allowNull: false,
  }
}, {
  tableName: 'admin', 
  timestamps: false,  
});

module.exports = Admin;
