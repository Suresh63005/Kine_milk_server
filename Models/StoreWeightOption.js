const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const StoreWeightOption = sequelize.define(
  "StoreWeightOption",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_inventory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tbl_productInventory",
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Product",
        key: "id",
      },
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "tbl_storeWeightOption",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = StoreWeightOption;