const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Product = sequelize.define(
  "ProductImages",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    img:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    status:{
        type:DataTypes.NUMBER,
        allowNull:false,
        defaultValue:1
    } 
  },
  { tableName: "tbl_product_images", timestamps: true, paranoid: true }
);

module.exports = Product;