const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const PayoutSetting = sequelize.define('PayoutSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  proof: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Default to current date
  },
}, {
  tableName: 'tbl_payout_settings',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
});

module.exports = PayoutSetting;