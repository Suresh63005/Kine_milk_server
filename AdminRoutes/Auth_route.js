const express = require("express");
const router = express.Router();

const adminController = require('../AdminControllers/Auth_controller');



router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
// router.get(
//   "/userbytoken",
//   adminMiddleware.isAdmin,
//   adminController.getUserbyToken
// );
// router.put("/update/:id", adminMiddleware.isAdmin, adminController.updateAdmin);


// router.get("/search", adminMiddleware.isAdmin, adminController.searchAdmins);
// router.post("/logout", adminMiddleware.isAdmin, adminController.logoutAdmin);
// router.delete('/delete/:id', adminMiddleware.isAdmin, adminController.deleteAdmin);
// router.get('/all-admins', adminMiddleware.isAdmin, adminController.getAllAdmins);
// router.get('/single-admin/:id', adminMiddleware.isAdmin, adminController.getAdminById);
// router.post('/logout', adminMiddleware.isAdmin, adminController.logoutAdmin);
// router.get('/protected',  authMiddleware.authenticateToken, (req, res) => {
//     res.json({ message: `Welcome, ${req.user.username}` });
//   });



module.exports = router;
