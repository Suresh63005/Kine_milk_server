const express=require("express")
const router=express.Router();
const faqController=require("../AdminControllers/Faq.Controller");

router.post("/upsert",faqController.upsertFaq); //1
router.get("/all",faqController.getAllFaqs) //1
router.get("/getbyid/:id",faqController.getFaqById) //1
router.delete("/delete/:id",faqController.deleteFaq)
router.get("/count",faqController.getFaqCount) //1

module.exports=router