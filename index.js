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
// const swaggerFile = require('./swagger-output.json');
// require("./models/index");


// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));



// Models 

const admin = require("./Models/Admin");


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