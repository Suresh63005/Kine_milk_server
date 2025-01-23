const express=require("express")
const router=express.Router();
const productController=require("../AdminControllers/product.Controller");
const upload = require("../utils/multerConfig");

router.post("/upsert", upload.fields([{ name: 'img', maxCount: 1 }, { name: 'ext_img', maxCount: 10 }]), productController.upsertProduct);
router.get("/all",productController.getAllProducts)
router.get("/getbyid/:id",productController.getProductById)
router.delete("/delete/:id",productController.getAllProducts)
router.patch("/update/:id",productController.getAllProducts)
router.get("/count",productController.getProductCount)
router.patch("/toggle-status",productController.toggleproductStatus)

module.exports=router