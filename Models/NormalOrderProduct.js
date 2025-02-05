const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const NormalOrderProduct = sequelize.define(
  "NormalOrderProduct",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    oid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    pquantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ptitle: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pdiscount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pimg: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pprice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ptype: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { tableName: "tbl_normal_order_product", timestamps: true, paranoid: true }
);

module.exports = NormalOrderProduct;
