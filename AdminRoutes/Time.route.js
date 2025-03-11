const express=require("express")
const router=express.Router();
const timeController=require("../AdminControllers/Time.Controller");

router.post("/upsert/:store_id", timeController.upsertTime); 
router.get("/all/:store_id",timeController.getAllTimes) //1
router.get("/getbyid/:id",timeController.getTimeById) //1
router.delete("/delete/:id",timeController.deleteTime)
router.get("/count",timeController.getTimeCount) //1
router.patch('/toggle-status',timeController.toggleTimeStatus)

module.exports=router