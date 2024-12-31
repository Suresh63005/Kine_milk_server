const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Assuming you want auto-incrementing IDs
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_page', // Match the table name in the database
  timestamps: false, // Disable timestamps if not present in your table
  charset: 'latin1',
  collate: 'latin1_general_ci',
});

module.exports = Page;