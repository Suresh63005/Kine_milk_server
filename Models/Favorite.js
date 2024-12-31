const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  zone_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tbl_fav', // Match the table name in the database
  timestamps: false, // Disable timestamps as they're not included in the table schema
  charset: 'latin1', // Match the charset specified in the table definition
});

module.exports = Favorite;
