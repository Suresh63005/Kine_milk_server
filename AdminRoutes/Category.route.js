const express=require("express")
const router=express.Router();
const categoryController=require("../AdminControllers/Category.Controller");
const upload = require("../utils/multerConfig");
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const allowAdminOrAuthenticated = (req, res, next) => {
    adminMiddleware.isAdmin(req, res, (adminErr) => {
        if (!adminErr) return next();

        authMiddleware.isAuthenticated(req, res, (authErr) => {
            if (!authErr) return next();

            return res.status(403).json({ message: "Access denied. Admin or authenticated user required." });
        });
    });
};

router.post("/upsert",adminMiddleware.isAdmin, upload.single("img"),categoryController.upsertCategory);
router.get("/all",allowAdminOrAuthenticated,categoryController.getAllCategories)
router.get("/getbyid/:id",categoryController.getCategoryById)
router.delete("/delete/:id",adminMiddleware.isAdmin,categoryController.deleteCategory)
router.patch("/update/:id",adminMiddleware.isAdmin,categoryController.upsertCategory)
router.get("/count",adminMiddleware.isAdmin,categoryController.getCategoryCount)
router.patch("/toggle-status",adminMiddleware.isAdmin,categoryController.toggleCategoryStatus)

module.exports=router