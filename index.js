const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
const app = express();
// const httpserver = http.createServer(app);
const dotEnv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const sequelize = require("./config/db");
const PORT = process.env.PORT || 5001;
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express');
const logger=require("morgan")
app.use(logger('dev'))
// const swaggerFile = require('./swagger-output.json');
// require("./models/index");


// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));



// Models 

const admin = require("./Models/Admin");
const address = require("./Models/Address");
const Banner = require("./Models/Banner");
const Cash = require("./Models/Cash");
const Category = require("./Models/Category");
const Coupon = require("./Models/Coupon");
const Delivery = require("./Models/Delivery");
const Favorite = require("./Models/Favorite");
const Mcat = require("./Models/Mcat");
const Milk = require("./Models/Milk");
const NormalOrder = require("./Models/NormalOrder");
const NormalOrderProduct = require("./Models/NormalOrderProduct");
const Notification = require("./Models/Notification");
const Page = require("./Models/Page");
const PaymentList = require("./Models/PaymentList");
const PayoutSetting = require("./Models/PayoutSetting");
const Photo = require("./Models/Photo");
const Product = require("./Models/Product");
const ProductAttribute = require("./Models/ProductAttribute");
const Rider = require("./Models/Rider");
const Rnoti = require("./Models/Rnoti");
const ServiceDetails = require("./Models/ServiceDetails");
const Snoti = require("./Models/Snoti");
const SubscribeOrder = require("./Models/SubscribeOrder");
const SubscribeOrderProduct = require("./Models/SubscribeOrderProduct");
const Time = require("./Models/Time");
const User = require("./Models/User");
const WalletReport = require("./Models/WalletReport");
const Zone = require("./Models/Zone");




app.use(morgan("dev"));
// Middlewares
dotEnv.config();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

sequelize
  .sync()
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Unable to create the database:", err);
  });



app.use('/user', require('./AdminRoutes/Auth_route'))

app.get("/", (req, res) => {
    res.send("Server is Running");
  });

  app.listen(PORT, () => {
    console.log(`Server is Running on PORT http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });