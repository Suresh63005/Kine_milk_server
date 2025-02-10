const express = require('express');
const router = express.Router();
const customerAuthController = require('../../UserControllers/Customer/customer_auth_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post("/verify-customer",authMiddleware.isAuthenticated,customerAuthController.VerifyCustomerMobile)
router.get("/customer-details",authMiddleware.isAuthenticated,customerAuthController.FetchCustomerDetails)
router.patch("/edit-customer",authMiddleware.isAuthenticated,customerAuthController.UpdateCustomerDetails)

module.exports = router