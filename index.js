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
const MilkCategory = require("./Models/MilkCategory");
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
const RiderNotification = require("./Models/RiderNotification");
const ServiceDetails = require("./Models/ServiceDetails");
const StoreNotification = require("./Models/StoreNotification");
const SubscribeOrder = require("./Models/SubscribeOrder");
const SubscribeOrderProduct = require("./Models/SubscribeOrderProduct");
const Time = require("./Models/Time");
const User = require("./Models/User");
const WalletReport = require("./Models/WalletReport");
const Zone = require("./Models/Zone");
const Store = require('./Models/Store');
const index = require("./Models/index");

app.use(morgan("dev"));
// Middlewares
dotEnv.config();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
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

app.use('/admin', require('./AdminRoutes/Auth_route'))
app.use("/category",require("./AdminRoutes/Category.route"))
app.use("/product",require("./AdminRoutes/Product.route"))
app.use("/product-attribute",require("./AdminRoutes/ProductAttributes.route"))
app.use("/product-images",require("./AdminRoutes/ProductImages.route"))
app.use("/delivery",require("./AdminRoutes/Delivery.route"))
app.use("/coupon",require("./AdminRoutes/Couppon.route"))
app.use("/rider",require("./AdminRoutes/Rider.route"))
// app.use("/gallery",require("./AdminRoutes/Gallery.route"))
app.use("/faq",require("./AdminRoutes/Faq.route"))
app.use("/time",require("./AdminRoutes/Time.route"))
app.use("/normalorder",require("./AdminRoutes/NormalOrder.route"))
app.use("/banner",require('./AdminRoutes/Banner.route'))
app.use("/store",require('./AdminRoutes/Store.route'))

app.get("/", (req, res) => {
    res.send("Server is Running");
  });

app.listen(PORT, () => {
  console.log(`Server is Running on PORT http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});