require("dotenv").config();
const admin = require("firebase-admin");
const storeServiceAccount = require('./serviceAccountKey.json');
const deliveryServiceAcccount = require('./delivery-serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const storeFirebase = admin.initializeApp({
  credential: admin.credential.cert(storeServiceAccount),
}, "store");

// Initialize Delivery Firebase App
const deliveryFirebase = admin.initializeApp({
  credential: admin.credential.cert(deliveryServiceAcccount),
}, "delivery");

module.exports = {storeFirebase,deliveryFirebase};
