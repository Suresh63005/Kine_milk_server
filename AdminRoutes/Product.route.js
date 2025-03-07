const express=require("express")
const router=express.Router();
const { upsertProduct, getAllProducts, getProductById, getProductCount, toggleproductStatus } = require("../AdminControllers/Product.Controller");
const upload = require("../utils/multerConfig");

<<<<<<< HEAD
router.post("/upsert", upload.fields([{ name: 'img', maxCount: 1 }, { name: 'ext_img', maxCount: 10 }]), productController.upsertProduct);
router.get("/all",productController.getAllProducts)
router.get("/getbyid/:id",productController.getProductById)
router.delete("/delete/:id",productController.getAllProducts)
router.patch("/update/:id",productController.getAllProducts)
router.get("/count",productController.getProductCount)
router.patch("/toggle-status",productController.toggleproductStatus)
=======
router.post("/upsert/:storeId", upload.fields([
    { name: "img", maxCount: 1 },
    { name: "extraImages", maxCount: 5 }
]), upsertProduct);
router.get("/all",getAllProducts)
router.get("/getbyid/:id",getProductById)
router.delete("/delete/:id",getAllProducts)
router.patch("/update/:id",getAllProducts)
router.get("/count",getProductCount)
router.patch("/toggle-status",toggleproductStatus)


>>>>>>> b2fe3a94414dc641db2556705db01886cbb43ba8

module.exports=router