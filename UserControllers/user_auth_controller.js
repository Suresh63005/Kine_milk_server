const User = require('../Models/User');
const asyncHandler = require('../middlewares/errorHandler');
const { otpLoginSchema, verifyOtpSchema } = require('../utils/validation');
const jwt = require('jsonwebtoken');

const otpLogin = asyncHandler(async(req,res)=>{
    const {error}=otpLoginSchema.validate(req.body);
    if(error) res.status(400).json({error:error.details[0].message})
    const {ccode,mobile}=req.body;
    if(!ccode || !mobile){
        return res.status(403).json({
            message:"All Fields Required!"
        })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const timestamp = new Date();
        const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
        const [user, created]=await User.findOrCreate({
            where:{mobile,ccode},
            defaults:{mobile,otp,otpExpiresIn,registartion_date:timestamp}
        });
        if(!created){
            await user.update({otp,otpExpiresIn})
        }
        await user.update({status:1})
        return res.status(200).json({
            ResponseCode:"200",
            message: "OTP sent successfully!",
            success:true,
            otp });
    } catch (error) {
        console.log("Error Otp Login",error.message);
        res.status(500).json({message:"Error Sending OTP: "+error.message})
    }
});

const verifyOtp = asyncHandler(async(req,res)=>{
    const {error}=verifyOtpSchema.validate(req.body);
    if(error) res.status(400).json({error:error.details[0].message})
    const {ccode,mobile,otp}=req.body;
    if(!ccode || !mobile || !otp){
        return res.status(403).json({message:"All Fields Required!"})
    }
    try {
        const user = await User.findOne({where:{mobile,ccode}})
        if(!user){
            res.status(401).json({
            ResponseCode:"401",
            message: "User not foud!",
            success:false,
            })
        }
        if(user.otp !== otp || new Date() > (user.otpExpiresIn)){
            return res.status(401).json({message:"Invalid or Expired OTP."})
        }
        const token = jwt.sign({userId:user.id,mobile:user.mobile},process.env.JWT_SECRET)
        await user.update({status:1,otp:null,otpExpiresIn:null})
        const formattedDate = user.registartion_date 
        ? new Date(user.registartion_date).toISOString().replace("T", " ").split(".")[0] 
        : null;
        
            res.status(200).json({message:"OTP Verified Successfully!",
            token,
            user:{
            id:user.id,
            mobile:user.mobile,
            email:user.email,
            ccode:user.ccode,
            registartion_date:formattedDate
            }
        })
    } catch (error) {
        console.log("Error Verifying Otp.",error.message);
        res.status(500).json({message:"Error Verifying OTP: "+ error.message})
    }
})

module.exports = {otpLogin,verifyOtp}