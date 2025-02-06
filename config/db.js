const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectModule:require('mysql2'),
    port: process.env.DB_PORT ,
    logging: console.log,
    pool: {
        max: 10, 
        min: 0,  
        acquire: 30000, 
        idle: 10000, 
      },
  });

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });


module.exports = sequelize;

