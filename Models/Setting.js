const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Setting = sequelize.define(
  "Setting",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    webname: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    weblogo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pstore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    onesignal_keyId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    onesignal_apikey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    onesignal_appId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scredit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rcredit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_charges: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    store_charges: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    tax: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  { tableName: "tbl_setting", timestamps: true, paranoid: true }
);

module.exports = Setting;