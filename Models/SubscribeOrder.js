const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const SubscribeOrder = sequelize.define(
  "SubscribeOrder",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    odate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    p_method_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    landmark: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lattitude:{
      type:DataTypes.TEXT,
      allowNull:true
    },
    longtitude:{
      type:DataTypes.TEXT,
      allowNull:true
    },
    o_type: {
      type: DataTypes.ENUM("Delivery", "Self Pickup"),
      allowNull: false,
    },
    d_charge: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cou_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    cou_amt: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    o_total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    trans_id: {
      type: DataTypes.UUID,
      defaultValue: null,
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
      type: DataTypes.UUID,
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
      type: DataTypes.ENUM("Pending", "Processing", "Completed", "Cancelled"),
      allowNull: false,
    },
    is_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      dialectTypes: 0,
    },
    review_date: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    total_rate: {
      type: DataTypes.INTEGER,
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
    comment_reject: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  },
  { tableName: "tbl_subscribe_order", timestamps: true, paranoid: true }
);

module.exports = SubscribeOrder;
