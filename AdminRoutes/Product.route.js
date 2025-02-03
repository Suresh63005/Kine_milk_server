const express=require("express")
const router=express.Router();


const upload = require("../utils/multerConfig");
const { upsertProduct, getAllProducts, getProductById, getProductCount, toggleproductStatus } = require("../AdminControllers/product.Controller");

router.post("/upsert",upload.single("img"),upsertProduct);
router.get("/all",getAllProducts)
router.get("/getbyid/:id",getProductById)
router.delete("/delete/:id",getAllProducts)
router.patch("/update/:id",getAllProducts)
router.get("/count",getProductCount)
router.patch("/toggle-status",toggleproductStatus)



module.exports=router