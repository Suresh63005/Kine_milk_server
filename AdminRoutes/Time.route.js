const express=require("express")
const router=express.Router();
const timeController=require("../AdminControllers/Time.Controller");

router.post("/upsert", timeController.upsertTime); 
router.get("/all",timeController.getAllTimes) //1
router.get("/getbyid/:id",timeController.getTimeById) //1
router.delete("/delete/:id",timeController.deleteTime)
router.get("/count",timeController.getTimeCount) //1

module.exports=router