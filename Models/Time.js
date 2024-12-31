const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const Time = sequelize.define('Time', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Assuming you want auto-incrementing IDs
    allowNull: false,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mintime: {
    type: DataTypes.TIME, // Use TIME for time values
    allowNull: false,
  },
  maxtime: {
    type: DataTypes.TIME, // Use TIME for time values
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tbl_time', // Match the table name in the database
  timestamps: false, // Disable timestamps if not present in your table
  charset: 'latin1',
  collate: 'latin1_general_ci',
});

module.exports = Time;