const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const Milk = sequelize.define('Milk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Assuming you want auto-incrementing IDs
    allowNull: false,
  },
  data: {
    type: DataTypes.LONGTEXT, // Use LONGTEXT for large text data
    allowNull: false,
  },
}, {
  tableName: 'tbl_milk', // Match the table name in the database
  timestamps: false, // Disable timestamps if not present in your table
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
});

module.exports = Milk;