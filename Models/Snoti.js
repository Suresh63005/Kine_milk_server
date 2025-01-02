const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')
=======
const sequelize = require('../config/db'); 


const Snoti = sequelize.define('Snoti', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  sid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tbl_snoti', 

  timestamps: true,


});

module.exports = Snoti;