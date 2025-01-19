const express=require("express")
const router=express.Router();
const orderController=require("../AdminControllers/NormalOrder.Controller");

// router.post("/add",orderController.upsertorder); //1
router.get("/all",orderController.getAllNorOrders) //1
// router.get("/getbyid/:id",orderController.getorderById) //1
// router.delete("/delete/:id",orderController.deleteorder)
// router.get("/count",orderController.getorderCount) //1

module.exports=router