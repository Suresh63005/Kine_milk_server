const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Zone = sequelize.define('zones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coordinates: {
    type: DataTypes.GEOMETRY('POLYGON'),
    allowNull: false,
  },
  alias: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  tableName: 'zones',
  timestamps: false,
  charset: 'latin1',
});

module.exports = Zone;
