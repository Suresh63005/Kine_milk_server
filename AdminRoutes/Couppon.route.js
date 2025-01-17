const express=require("express")
const router=express.Router();
const couponController=require("../AdminControllers/Couppon.Controller");
const upload = require("../utils/multerConfig");

router.post("/upsert", upload.single("coupon_img"),couponController.upsertCoupon);
router.get("/all",couponController.getAllCoupon)
router.get("/getbyid/:id",couponController.getCouponById)
router.delete("/delete/:id",couponController.deleteCoupon)
// router.patch("/update/:id",couponController.upsertcoupon)
router.get("/count",couponController.getCouponCount)
router.patch("/toggle-status",couponController.toggleCouponStatus)

module.exports=router