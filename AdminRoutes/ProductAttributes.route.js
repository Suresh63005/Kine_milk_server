const express=require("express")
const router=express.Router();
const ProductAtrributeController=require("../AdminControllers/ProductAtrribute.Controller");

router.post("/upsert",ProductAtrributeController.upsertProductAttribute);
router.get("/all",ProductAtrributeController.getAllProductAttribute)
router.get("/getbyid/:id",ProductAtrributeController.getProductAttributeById)
router.delete("/delete/:id",ProductAtrributeController.deleteProductAttribute)
router.patch("/update/:id",ProductAtrributeController.getProductAttributeById)
router.get("/count",ProductAtrributeController.getProductAttributeCount)
router.patch("/toggle-status",ProductAtrributeController.toggleproductAttributeStatus)

module.exports=router