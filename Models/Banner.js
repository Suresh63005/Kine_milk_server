const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

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
  timestamps: false, // Disable timestamps if not present in your table
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

module.exports = Banner;
