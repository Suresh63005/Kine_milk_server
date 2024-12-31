const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Path to your sequelize instance

const Zone = sequelize.define('zones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true, // Assuming auto increment for the id field
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
  timestamps: false, // Assuming the table doesn't have createdAt and updatedAt columns
  charset: 'latin1',  // You can adjust the charset as needed
});

module.exports = Zone;
