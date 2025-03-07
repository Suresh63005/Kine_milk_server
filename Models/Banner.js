const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Banner = sequelize.define(
  "Banner",
  {
   id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "banner", timestamps: true, paranoid: true }
);

module.exports = Banner;
