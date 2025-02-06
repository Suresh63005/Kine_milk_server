const express=require("express")
const router=express.Router();
const { upsertProduct, getAllProducts, getProductById, getProductCount, toggleproductStatus } = require("../AdminControllers/product.Controller");
const upload = require("../utils/multerConfig");

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



module.exports=router