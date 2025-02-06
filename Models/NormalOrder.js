const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const NormalOrder = sequelize.define(
  "NormalOrder",
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
      allowNull: true,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    timeslot_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tax: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    d_charge: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cou_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    cou_amt: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
      allowNull: true,
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
      allowNull: true,
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
      defaultValue: "Pending",
    },
    comment_reject: {
      type: DataTypes.TEXT,
      defaultValue: null,
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