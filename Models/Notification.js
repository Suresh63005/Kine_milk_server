const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Notification = sequelize.define(
  "Notification",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    uid: {
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
  },
  { tableName: "tbl_notification", timestamps: true, paranoid: true }
);

module.exports = Notification;
