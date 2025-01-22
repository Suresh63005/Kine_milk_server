const express=require("express")
const router=express.Router();
const faqController=require("../AdminControllers/Faq.Controller");
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert",adminMiddleware.authMiddleware,faqController.upsertFaq); //1
router.get("/all",faqController.getAllFaqs) //1
router.get("/getbyid/:id",faqController.getFaqById) //1

router.delete("/delete/:id",adminMiddleware.authMiddleware,faqController.deleteFaq)
router.get("/count",adminMiddleware.authMiddleware,faqController.getFaqCount) //1

router.patch("/toggle-status",faqController.toggleFaqStatus);


module.exports=router