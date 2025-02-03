const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const NormalOrder = sequelize.define(
  "NormalOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    odate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    p_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    landmark: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    d_charge: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cou_id: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cou_amt: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    trans_id: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    a_note: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    a_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wall_amt: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Processing",
        "Completed",
        "Cancelled",
        "On Route"
      ),
      allowNull: false,
    },
    comment_reject: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    tslot: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    o_type: {
      type: DataTypes.ENUM("Delivery", "Self Pickup"),
      allowNull: false,
    },
    is_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    review_date: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    total_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    rate_text: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    commission: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    store_charge: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    order_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sign: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  },
  { tableName: "tbl_normal_order", timestamps: true, paranoid: true }
);

module.exports = NormalOrder