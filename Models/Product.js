<<<<<<< HEAD
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db')

const Product = sequelize.define('Product', {
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
  cat_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  img: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  subscribe_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  normal_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  out_of_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscription_required: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ext_img: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {

  tableName: 'tbl_product',
  timestamps: true,

});

module.exports = Product;
=======
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Product = sequelize.define(
  "Product",
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
    cat_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT, // "long" is not needed in Sequelize
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscribe_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    normal_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    out_of_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscription_required: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mrp_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity:{
      type:DataTypes.BIGINT,
      defaultValue:0
    },
    date:{
      type:DataTypes.DATEONLY,
      allowNull:true
    }
  },
  {
    tableName: "tbl_product",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Product;
>>>>>>> b2fe3a94414dc641db2556705db01886cbb43ba8
