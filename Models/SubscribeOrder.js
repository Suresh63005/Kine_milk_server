const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/your/sequelize/instance'); // Adjust the path to your Sequelize instance

const SubscribeOrder = sequelize.define('SubscribeOrder', {
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
    allowNull: true,
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
    allowNull: true,
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
    allowNull: true,
  },
  a_note: {
    type: DataTypes.TEXT,
    allowNull: true,
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
    type: DataTypes.ENUM('Pending', 'Processing', 'Completed', 'Cancelled'),
    allowNull: false,
  },
  is_rate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  review_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  total_rate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rate_text: {
    type: DataTypes.TEXT,
    allowNull: true,
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
    allowNull: true,
  },
  comment_reject: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'tbl_subscribe_order', // Match the table name in the database
  timestamps: false, // Disable timestamps since they're not in the table schema
  charset: 'latin1', // Match the charset specified in the table definition
});

module.exports = SubscribeOrder;