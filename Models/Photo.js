const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')


const Photo = sequelize.define('Photo', {
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
  img: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

  tableName: 'tbl_photo', // Match the table name in the database
  timestamps: true,

});

module.exports = Photo;