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
      type: DataTypes.UUID,
      allowNull: false,
    },
    pid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    weight_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { tableName: "tbl_fav", timestamps: true, paranoid: true }
);

module.exports = Favorite;
