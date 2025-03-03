const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const WalletReport = sequelize.define(
  "WalletReport",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:1
    },
    amt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transaction_no:{
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

  },
  { tableName: "wallet_report", timestamps: true, paranoid: true }
);

module.exports = WalletReport;
