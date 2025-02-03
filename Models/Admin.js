const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Admin = sequelize.define('Admin',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{tableName: 'admin', timestamps: true,paranoid:true});

module.exports = Admin;