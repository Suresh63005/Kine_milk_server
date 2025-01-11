const express=require("express")
const router=express.Router();
const faqController=require("../AdminControllers/Rider.Controller");

router.post("/add",faqController.upsertRider); 
router.get("/all",faqController.getAllRiders) //1
router.get("/getbyid/:id",faqController.getRiderById) //1
router.delete("/delete/:id",faqController.deleteRider)
router.get("/count",faqController.getRiderCount) //1

module.exports=router