const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Store = require("./Store");
const User = require("./User");
const PayoutSetting = require("./PayoutSetting");
const Address = require("./Address");
const Time = require("./Time");
const Coupon = require("./Coupon");
const Rider = require("./Rider");

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
      references: { model: Store, key: "id" },
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    odate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    p_method_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: PayoutSetting, key: "id" },
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Address, key: "id" },
    },
    o_type: {
      type: DataTypes.ENUM("Delivery", "Self Pickup"),
      allowNull: false,
    },

    timeslot_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Time, key: "id" },
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    delivered_dates: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    days: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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
      references: { model: Coupon, key: "id" },
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
      defaultValue: null,
    },
    a_note: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    a_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    rid: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: 0,
    },
    wall_amt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Active", "Completed", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
    is_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    feedback:{
      type:DataTypes.TEXT,
      allowNull:true
    },
    delivery_images: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    commission: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    store_charge: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
