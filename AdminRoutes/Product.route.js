const express=require("express")
const router=express.Router();
const productController=require("../AdminControllers/product.Controller");
const upload = require("../utils/multerConfig");
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert",adminMiddleware.authMiddleware,upload.single("img"),productController.upsertProduct);
router.get("/all",productController.getAllProducts)
router.get("/getbyid/:id",productController.getProductById)
router.delete("/delete/:id",adminMiddleware.authMiddleware,productController.getAllProducts)
router.patch("/update/:id",adminMiddleware.authMiddleware,productController.getAllProducts)
router.get("/count",adminMiddleware.authMiddleware,productController.getProductCount)
router.patch("/toggle-status",adminMiddleware.authMiddleware,productController.toggleproductStatus)

module.exports=router