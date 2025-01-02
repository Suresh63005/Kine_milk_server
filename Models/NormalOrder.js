const { DataTypes } = require('sequelize');

const sequelize = require('../config/db')


const NormalOrder = sequelize.define('NormalOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
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
    type: DataTypes.DATEONLY,
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
  o_total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  trans_id: {
    type: DataTypes.TEXT,
  },
  a_note: {
    type: DataTypes.TEXT,
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
    type: DataTypes.ENUM('Pending', 'Processing', 'Completed', 'Cancelled', 'On Route'),
    allowNull: false,
  },
  comment_reject: {
    type: DataTypes.TEXT,
  },
  tslot: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  o_type: {
    type: DataTypes.ENUM('Delivery', 'Self Pickup'),
    allowNull: false,
  },
  is_rate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  review_date: {
    type: DataTypes.DATE,
  },
  total_rate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rate_text: {
    type: DataTypes.TEXT,
  },
  commission: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  store_charge: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  order_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sign: {
    type: DataTypes.TEXT,
  },
}, {

  tableName: 'tbl_normal_order', // Match the table name in the database
  timestamps: true,

});

module.exports = NormalOrder;
