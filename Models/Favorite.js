const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Favorite = sequelize.define(
  "Favorite",
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
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "tbl_fav", timestamps: true, paranoid: true }
);

module.exports = Favorite;
