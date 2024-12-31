const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ServiceDetails = sequelize.define('ServiceDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rimg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  slogan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lcode: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  catid: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  full_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pincode: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  landmark: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lats: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  longs: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  store_charge: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dcharge: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  morder: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commission: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  bank_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ifsc: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  receipt_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  acc_number: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paypal_id: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  upi_id: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rstatus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  mobile: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sdesc: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  charge_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ukm: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  uprice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  aprice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  zone_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cover_img: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  slogan_title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cdesc: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  opentime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  closetime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  cancle_policy: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_pickup: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'service_details',
  timestamps: false, 
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci',
});

module.exports = ServiceDetails;
