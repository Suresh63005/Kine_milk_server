const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Store = sequelize.define(
  "Store",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // Store Details
    store_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    store_logo: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    store_cover_image: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    c_license_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    slogan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    slogan_subtitle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    s_open_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    s_close_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    s_pickup_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("tags");
        return rawValue ? rawValue.split(",") : [];
      },
      set(value) {
        this.setDataValue("tags", Array.isArray(value) ? value.join(",") : value);
      },
    },
    short_desc: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cancel_policy: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Store Login Information
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Store Category
    s_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Store Address
    full_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    select_zone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Service Charges type
    service_charge_type: {
      type: DataTypes.ENUM("Fixed Charges", "Dynamic Charges"),
      allowNull: false,
    },
    // Store Service
    s_charge: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    min_order_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Store Admin Commission
    commission_rate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paypal_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_ifsc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acc_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    upi_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "tbl_store",
    paranoid: true,
    timestamps: true,
  }
);

module.exports = Store;
